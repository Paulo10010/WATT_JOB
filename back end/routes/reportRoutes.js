import express from 'express';
import prisma from '../prismaClient.js';
import authenticateToken, { authorizeRole } from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/', [authenticateToken, authorizeRole('SUPERVISOR')], async (req, res) => {
  try {
    const [supervisorCount, operatorCount, lastUserRegistered, finishedProcesses] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'SUPERVISOR' } }),
      prisma.user.count({ where: { role: 'OPERATOR' } }),
      prisma.user.findFirst({
        orderBy: { id: 'desc' },
        select: { name: true, role: true },
      }),
      prisma.manufacturingProcess.findMany({
        where: { status: 'FINISHED' },
      }),
    ]);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // --- LÓGICA DE PRODUÇÃO DIÁRIA ---
    const dailyProduction = Array(8).fill(0);
    const processesToday = finishedProcesses.filter(p => p.endTime >= todayStart);
    processesToday.forEach(p => {
      const hour = p.endTime.getHours();
      const part = Math.floor(hour / 3);
      // ALTERADO: Em vez de somar o comprimento, incrementamos em 1 para contar a bobina.
      dailyProduction[part]++;
    });

    // --- LÓGICA DE PRODUÇÃO SEMANAL (ÚLTIMOS 7 DIAS) ---
    // A lógica foi reestruturada para gerar os dados na ordem correta (do mais antigo para o mais novo).
    const weeklyProduction = Array(7).fill(0);
    const weeklyLabels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      // Adiciona o rótulo (ex: "Sáb") ao final do array.
      weeklyLabels.push(date.toLocaleString('pt-BR', { weekday: 'short' }));

      // Calcula a produção para aquele dia.
      let coilsThisDay = 0;
      finishedProcesses.forEach(p => {
        if (p.endTime >= dayStart && p.endTime < dayEnd) {
          // ALTERADO: Contamos +1 para cada bobina encontrada.
          coilsThisDay++;
        }
      });
      // Adiciona a produção do dia ao final do array de dados.
      // O array de rótulos e de dados crescem em sincronia, na ordem correta.
      weeklyProduction[weeklyLabels.length - 1] = coilsThisDay;
    }


    // --- LÓGICA DE PRODUÇÃO MENSAL (ÚLTIMAS 4 SEMANAS) ---
    const monthlyProduction = Array(4).fill(0);
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(now.getDate() - 28);

    const processesLast4Weeks = finishedProcesses.filter(p => p.endTime >= twentyEightDaysAgo);

    processesLast4Weeks.forEach(p => {
      const daysAgo = (now.getTime() - p.endTime.getTime()) / (1000 * 60 * 60 * 24);
      const weekIndex = Math.floor(daysAgo / 7);
      
      if (weekIndex < 4) {
        // O índice `3 - weekIndex` já organiza os dados com a semana mais antiga primeiro
        // e a mais recente por último. (ex: semana de 28 dias atrás -> índice 0).
        // ALTERADO: Incrementa a contagem de bobinas em vez de somar o comprimento.
        monthlyProduction[3 - weekIndex]++;
      }
    });

    // --- MONTANDO A RESPOSTA FINAL PARA O FRONTEND ---
    const reportData = {
      userStats: {
        supervisorCount,
        operatorCount,
        lastUserRegistered: lastUserRegistered || null,
      },
      productionStats: {
        daily: {
          labels: ['0-3h', '3-6h', '6-9h', '9-12h', '12-15h', '15-18h', '18-21h', '21-24h'],
          data: dailyProduction,
        },
        weekly: {
          labels: weeklyLabels,
          data: weeklyProduction,
        },
        monthly: {
          labels: ['21-28 dias atrás', '14-21 dias atrás', '7-14 dias atrás', 'Últimos 7 dias'],
          data: monthlyProduction,
        },
      },
    };

    res.status(200).json(reportData);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Não foi possível gerar o relatório.' });
  }
});

export default router;