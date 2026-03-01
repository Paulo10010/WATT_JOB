/* GESTOR DE ROTAS DO PROCESSO DE FABRICAÇÃO
 Pense neste ficheiro como a "sala de controle" da sua fábrica.
  Ele é responsável por todas as operações relacionadas a um processo de fabrico:
   1. Iniciar um novo processo.
   2. Monitorizar o progresso de um processo em andamento.
   3. Cancelar um processo que está a decorrer.
*/

import express from 'express';
import prisma from '../prismaClient.js';
/* Importamos o nosso "segurança de porta" para garantir que apenas utilizadores
   logados podem interagir com os processos.*/
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

/* GESTOR DE PROCESSOS ATIVOS
   Imagine isto como uma "lousa" na sala de controle. Quando um novo processo
   é iniciado, nós anotamos o seu ID e o "ID do temporizador" que o irá finalizar.
   Isto é crucial para que possamos encontrar e cancelar a finalização automática
   se o operador decidir parar o processo a meio.
   Por estar na memória do servidor, esta lousa é limpa sempre que o servidor reinicia.*/
const activeProcesses = new Map();


/*  ROTA PARA CRIAR E INICIAR UM NOVO PROCESSO 
   Esta é a rota que o frontend chama quando o operador preenche todas as
   informações e clica para "Iniciar Fabricação".*/
router.post('/create', authenticateToken, async (req, res) => {
  /*  Relação com o Frontend 
     O frontend envia um objeto JSON no corpo (body) da requisição com os
     detalhes do processo: warehouse, coilDiameter, e totalWireLength.
     Ele também deve enviar o token de autenticação do utilizador no cabeçalho.*/
  const { warehouse, coilDiameter, totalWireLength } = req.body;

  /*  Validações no Backend 
     Nunca confiamos apenas no frontend. O backend sempre faz as suas próprias
     verificações para garantir que os dados são válidos e consistentes.*/
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
    // Calculamos a hora de início e a hora de fim prevista com base na fórmula.
    const startTime = new Date();
    const durationInMs = (totalWireLength / coilDiameter) * 15 * 1000;
    const predictedEndTime = new Date(startTime.getTime() + durationInMs);

    // Criamos um novo registo na tabela 'manufacturingProcess' com o estado 'IN_PROGRESS'.
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

    console.log(`Processo ${newProcess.id} iniciado. Duração: ${durationInMs / 1000}s.`);

    /*  Lógica Assíncrona (O "Robô da Fábrica") 
       Usamos 'setTimeout' para agendar uma tarefa a ser executada no futuro.
       O servidor não fica "preso" à espera. Ele agenda a tarefa e continua o seu trabalho.*/
    const timeoutId = setTimeout(async () => {
      try {
        // Quando o tempo calculado se esgotar, este código será executado.
        await prisma.manufacturingProcess.update({
          where: { id: newProcess.id },
          data: { status: 'FINISHED' },
        });
        console.log(`Processo ${newProcess.id} teve o seu status atualizado para FINISHED.`);
      } catch (error) {
        console.error(`Erro ao atualizar o status do processo ${newProcess.id}:`, error);
      } finally {
        // Quer o processo termine com sucesso ou com erro, removemo-lo da nossa "lousa".
        activeProcesses.delete(newProcess.id);
      }
    }, durationInMs);

    // Anotamos o ID do processo e o ID do seu temporizador na nossa "lousa".
    activeProcesses.set(newProcess.id, timeoutId);

    /*  Relação com o Frontend 
       Enviamos uma resposta IMEDIATA para o frontend, confirmando que o processo
       foi iniciado. O frontend não precisa de esperar que a fabricação termine.
       O status 202 (Accepted) é perfeito para isto.*/
    res.status(202).json({
      message: 'Processo de fabricação iniciado com sucesso!',
      process: newProcess,
    });

  } catch (error) {
    console.error('Erro ao iniciar processo de fabricação:', error);
    res.status(500).json({ error: 'Não foi possível iniciar o processo.' });
  }
});


//  ROTA PARA OBTER O STATUS E O PROGRESSO 
// Esta rota permite ao frontend perguntar: "Qual é o andamento do processo X?".
router.get('/:id/status', authenticateToken, async (req, res) => {
  /*  Relação com o Frontend 
     O frontend irá chamar esta rota a cada poucos segundos (uma técnica chamada "polling")
     para obter a percentagem de progresso e atualizar a barra de progresso no ecrã.*/
  const { id } = req.params; // Pega o ID do processo da URL (ex: /processes/cmf123/status)

  try {
    const process = await prisma.manufacturingProcess.findUnique({
      where: { id: id },
    });

    if (!process) {
      return res.status(404).json({ error: 'Processo não encontrado.' });
    }

    //  LÓGICA DE CÁLCULO DE PROGRESSO 

    // Primeiro, recalculamos a duração total original do processo com base nos dados guardados.
    const totalDuration = (process.totalWireLength / process.coilDiameter) * 15 * 1000;
    const startTimeMs = process.startTime.getTime();

    // Caso 1: O processo foi FINALIZADO normalmente.
    if (process.status === 'FINISHED') {
      return res.json({
        status: process.status,
        progress: 100,
      });
    }

    // Caso 2: O processo foi CANCELADO.
    if (process.status === 'CANCELED') {
      // O tempo decorrido é a diferença entre a hora de início e a hora de cancelamento (guardada em 'endTime').
      const elapsedTime = process.endTime.getTime() - startTimeMs;
      // Calculamos a percentagem com base na duração total original.
      const progressPercentage = Math.min(100, Math.round((elapsedTime / totalDuration) * 100)); // Usamos Math.min para garantir que nunca passe de 100
      return res.json({
        status: process.status,
        progress: progressPercentage,
      });
    }

    // Caso 3: O processo está EM ANDAMENTO.
    const nowMs = new Date().getTime();
    const elapsedTime = nowMs - startTimeMs;

    if (elapsedTime >= totalDuration) {
      return res.json({
        status: 'FINISHED',
        progress: 100,
      });
    }

    const progressPercentage = Math.round((elapsedTime / totalDuration) * 100);

    res.json({
      status: process.status,
      progress: progressPercentage,
    });

  } catch (error) {
    console.error(`Erro ao buscar status do processo ${id}:`, error);
    res.status(500).json({ error: 'Não foi possível buscar o status do processo.' });
  }
});


//  ROTA PARA ATUALIZAR UM PROCESSO (CANCELAR) 
// Esta rota permite que o operador interrompa um processo que está em andamento.
router.patch('/:id', authenticateToken, async (req, res) => {
  /*  Relação com o Frontend 
     Quando o utilizador clica no botão "Cancelar", o frontend envia uma requisição
     PATCH para esta rota, com o corpo: { "status": "CANCELED" }.*/
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'CANCELED') {
    return res.status(400).json({ message: 'Ação inválida.', error: 'A única atualização permitida é para definir o status como CANCELED.' });
  }

  try {
    const process = await prisma.manufacturingProcess.findUnique({
      where: { id: id },
    });

    if (!process) {
      return res.status(404).json({ message: 'Falha no cancelamento.', error: `Processo com ID ${id} não foi encontrado.` });
    }

    if (process.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Ação não permitida.', error: `Não é possível cancelar um processo que já está ${process.status}.` });
    }

    // Procura o temporizador na nossa "lousa" de processos ativos.
    const timeoutId = activeProcesses.get(id);

    if (timeoutId) {
      // Se encontrar, cancela a finalização automática.
      clearTimeout(timeoutId);
      // E apaga a anotação da lousa.
      activeProcesses.delete(id);
      console.log(`Temporizador para o processo ${id} foi cancelado com sucesso.`);
    } else {
      console.log(`AVISO: Nenhum temporizador ativo encontrado para o processo ${id} (o servidor pode ter sido reiniciado).`);
    }

    // Atualiza o status do processo na base de dados para 'CANCELED'.
    const canceledProcess = await prisma.manufacturingProcess.update({
      where: { id: id },
      data: { status: 'CANCELED', endTime: new Date() },
    });

    // Envia uma resposta de sucesso para o frontend.
    res.status(200).json({
      message: 'Processo cancelado com sucesso!',
      process: canceledProcess,
    });

  } catch (error) {
    console.error(`Erro ao cancelar o processo ${id}:`, error);
    res.status(500).json({ message: 'Erro interno.', error: 'Ocorreu um erro inesperado ao tentar cancelar o processo.' });
  }
});


// Exportamos o router para que o nosso 'server.js' principal possa usá-lo.
export default router;

