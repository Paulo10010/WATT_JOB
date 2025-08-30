import express from 'express';
import prisma from '../prismaClient.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// --- ROTA PARA CRIAR E INICIAR UM NOVO PROCESSO DE FABRICAÇÃO ---
// (Seu código existente permanece aqui, sem alterações)
router.post('/create', authenticateToken, async (req, res) => {
  // 1. Recebe os dados do frontend.
  const { warehouse, coilDiameter, totalWireLength } = req.body;

  // 2. Validações de entrada (permanecem as mesmas).
  if (!warehouse || !coilDiameter || !totalWireLength) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: armazém, diâmetro e tamanho.' });
  }
  if (warehouse !== 'A' && warehouse !== 'B') {
    return res.status(400).json({ error: "Armazém inválido. Use 'A' ou 'B'." });
  }
  if (coilDiameter !== 20 && coilDiameter !== 40) {
    return res.status(400).json({ error: 'Diâmetro da bobina inválido. Use 20 ou 40.' });
  }
  if (typeof totalWireLength !== 'number' || totalWireLength <= 0) {
    return res.status(400).json({ error: 'O tamanho total do fio deve ser um número positivo.' });
  }

  try {
    // --- LÓGICA DE CRIAÇÃO ---
    const startTime = new Date();
    const durationInMs = (totalWireLength / coilDiameter) * 15 * 1000;
    const predictedEndTime = new Date(startTime.getTime() + durationInMs);

    const newProcess = await prisma.manufacturingProcess.create({
      data: {
        warehouse: warehouse,
        coilDiameter: coilDiameter,
        totalWireLength: totalWireLength,
        status: 'IN_PROGRESS',
        startTime: startTime,
        endTime: predictedEndTime,
      },
    });

    console.log(`Processo ${newProcess.id} iniciado. Duração: ${durationInMs / 1000}s. Fim previsto: ${predictedEndTime.toLocaleTimeString()}`);

    setTimeout(async () => {
      try {
        await prisma.manufacturingProcess.update({
          where: { id: newProcess.id },
          data: {
            status: 'FINISHED',
          },
        });
        console.log(`Processo ${newProcess.id} teve seu status atualizado para FINISHED.`);
      } catch (error) {
        console.error(`Erro ao atualizar o status do processo ${newProcess.id}:`, error);
        await prisma.manufacturingProcess.update({
          where: { id: newProcess.id },
          data: { status: 'CANCELED' },
        });
      }
    }, durationInMs);

    res.status(202).json({
      message: 'Processo de fabricação iniciado com sucesso!',
      process: newProcess,
    });

  } catch (error) {
    console.error('Erro ao iniciar processo de fabricação:', error);
    res.status(500).json({ error: 'Não foi possível iniciar o processo.' });
  }
});


// --- NOVA ROTA PARA OBTER O STATUS E O PROGRESSO DE UM PROCESSO ---
// O frontend chamará esta rota a cada poucos segundos para atualizar a barra de progresso.
router.get('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params; // Pega o ID do processo da URL

  try {
    const process = await prisma.manufacturingProcess.findUnique({
      where: { id: id },
    });

    if (!process) {
      return res.status(404).json({ error: 'Processo não encontrado.' });
    }

    // Se o processo já está finalizado ou cancelado, o progresso é sempre 100%.
    if (process.status === 'FINISHED' || process.status === 'CANCELED') {
      return res.json({
        status: process.status,
        progress: 100,
      });
    }

    // Lógica para calcular a percentagem do progresso
    const startTimeMs = process.startTime.getTime();
    const endTimeMs = process.endTime.getTime();
    const nowMs = new Date().getTime();

    const totalDuration = endTimeMs - startTimeMs;
    const elapsedTime = nowMs - startTimeMs;

    // Se o tempo decorrido for maior ou igual à duração total, consideramos 100%.
    if (elapsedTime >= totalDuration) {
      return res.json({
        status: 'FINISHED', // O setTimeout pode ter um pequeno atraso, então aqui já retornamos FINISHED
        progress: 100,
      });
    }

    const progressPercentage = Math.round((elapsedTime / totalDuration) * 100);

    // Retorna o status atual e a percentagem de progresso
    res.json({
      status: process.status,
      progress: progressPercentage,
    });

  } catch (error) {
    console.error(`Erro ao buscar status do processo ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível buscar o status do processo.' });
  }
});


export default router;

