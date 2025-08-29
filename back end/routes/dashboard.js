import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js'; // Importa o "segurança"

const router = express.Router();

// Define a rota GET /options, que será acessada como /dashboard/options
// Note que `authenticateToken` é passado como um middleware.
// Isso garante que a verificação do token acontece antes de executar o código da rota.
router.get('/options', authenticateToken, (req, res) => {
  // Se o código chegou até aqui, o token é válido.
  // O middleware já nos deu as informações do usuário em `req.user`.
  const userRole = req.user.role;

  let availableOptions = [];

  // O backend define as REGRAS com base na função do usuário.
  // O frontend usará esta resposta para construir a interface.
  if (userRole === 'SUPERVISOR') {
    availableOptions = ['relatorio', 'processo'];
  } else if (userRole === 'OPERATOR') {
    availableOptions = ['processo'];
  }

  // Retorna um JSON com as opções disponíveis para aquele usuário específico.
  res.status(200).json({ options: availableOptions });
});

export default router;

