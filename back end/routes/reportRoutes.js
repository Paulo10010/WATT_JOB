/* GESTOR DE ROTAS DE RELATÓRIO
 Pense neste ficheiro como o "departamento de análise de dados" da sua fábrica.
 A sua única responsabilidade é recolher informações da base de dados,
 processá-las e organizá-las num formato claro para que o frontend
 possa facilmente criar gráficos e painéis informativos para os supervisores.
 O acesso a estas rotas é estritamente controlado pelo nosso middleware.*/

import express from 'express';
import prisma from '../prismaClient.js';
/* Importamos os nossos "seguranças" para garantir que apenas um supervisor
   autenticado possa aceder a estes dados sensíveis.*/
import authenticateToken, { authorizeRole } from '../middleware/authenticateToken.js';

const router = express.Router();

/*  ROTA PRINCIPAL DE RELATÓRIOS 
   Esta é a única rota deste ficheiro. Quando chamada, executa todas as consultas
   e cálculos necessários para montar um relatório completo.*/
router.get('/', [authenticateToken, authorizeRole('SUPERVISOR')], async (req, res) => {
  try {
    /*  1. BUSCANDO OS DADOS BRUTOS DA BASE DE DADOS 
       Para sermos eficientes, pedimos à base de dados para fazer várias buscas
       ao mesmo tempo usando '$transaction'. É como pedir a vários assistentes
       para irem buscar documentos diferentes de uma só vez.*/
    const [supervisorCount, operatorCount, lastUserRegistered, finishedProcesses] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'SUPERVISOR' } }), // Conta quantos supervisores existem
      prisma.user.count({ where: { role: 'OPERATOR' } }),   // Conta quantos operadores existem
      prisma.user.findFirst({                               // Encontra o último utilizador registado
        orderBy: { id: 'desc' },
        select: { name: true, role: true },                 // Pega apenas o nome e a função
      }),
      prisma.manufacturingProcess.findMany({                // Pega TODOS os processos já finalizados
        where: { status: 'FINISHED' },
      }),
    ]);


    /*  2. PROCESSANDO DADOS DE PRODUÇÃO PARA OS GRÁFICOS 
     Agora que temos os dados brutos, vamos "cozinhá-los" para que fiquem
     prontos para serem servidos ao frontend.*/
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // O início do dia de hoje (meia-noite)

    //  LÓGICA DE PRODUÇÃO: HOJE (dividido em 8 partes de 3 horas) 
    const dailyProduction = Array(8).fill(0);
    const processesToday = finishedProcesses.filter(p => p.endTime >= todayStart);
    processesToday.forEach(p => {
      const hour = p.endTime.getHours();
      const part = Math.floor(hour / 3); // 0-2h -> parte 0, 3-5h -> parte 1, etc.
      dailyProduction[part] += p.totalWireLength;
    });

    //  LÓGICA DE PRODUÇÃO: ÚLTIMOS 7 DIAS 
    //  vamos olhar para os últimos 7 dias a contar de agora.
    const weeklyProduction = Array(7).fill(0);
    const weeklyLabels = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7); // Calcula a data de 7 dias atrás

    // Filtra apenas os processos que terminaram nos últimos 7 dias.
    const processesLast7Days = finishedProcesses.filter(p => p.endTime >= sevenDaysAgo);

    // Preenchemos os dados e os rótulos para cada um dos 7 dias.
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      // Adiciona um rótulo amigável (ex: "Sáb", "Dom", "Seg")
      weeklyLabels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
      
      // Soma a produção de todos os processos que terminaram naquele dia específico.
      processesLast7Days.forEach(p => {
        if (p.endTime >= dayStart && p.endTime < dayEnd) {
          weeklyProduction[6 - i] += p.totalWireLength;
        }
      });
    }

    //  LÓGICA DE PRODUÇÃO: ÚLTIMAS 4 SEMANAS 
    //  vamos olhar para as últimas 4 semanas (28 dias).
    const monthlyProduction = Array(4).fill(0);
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(now.getDate() - 28);

    // Filtra apenas os processos que terminaram nas últimas 4 semanas.
    const processesLast4Weeks = finishedProcesses.filter(p => p.endTime >= twentyEightDaysAgo);

    processesLast4Weeks.forEach(p => {
      const daysAgo = (now.getTime() - p.endTime.getTime()) / (1000 * 60 * 60 * 24);
      // Calcula em qual "fatia" de 7 dias o processo se encaixa.
      const weekIndex = Math.floor(daysAgo / 7);
      
      // Garante que o processo está dentro das nossas 4 semanas.
      if (weekIndex < 4) {
        // O índice `3 - weekIndex` organiza os dados com a semana mais recente no final.
        monthlyProduction[3 - weekIndex] += p.totalWireLength;
      }
    });


    //  3. MONTANDO A RESPOSTA FINAL PARA O FRONTEND 
    // Organizamos todos os dados calculados num único objeto JSON.
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
          labels: weeklyLabels.reverse(), // Invertemos para que "Hoje" fique no final
          data: weeklyProduction.reverse(),
        },
        monthly: {
          labels: ['21-28 dias atrás', '14-21 dias atrás', '7-14 dias atrás', 'Últimos 7 dias'],
          data: monthlyProduction,
        },
      },
    };

    /*  Relação com o Frontend 
       Enviamos a resposta final. O frontend irá receber este objeto e terá
       todos os dados já pré-processados e prontos para alimentar os componentes
       de gráficos, sem precisar de fazer nenhum cálculo complexo do seu lado.*/
    res.status(200).json(reportData);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Não foi possível gerar o relatório.' });
  }
});

// Exportamos o router para que o nosso 'server.js' principal possa usá-lo.
export default router;

