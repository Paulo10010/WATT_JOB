/* GESTOR DE ROTAS DO DASHBOARD
   Pense neste ficheiro como o "chefe de sala" de um restaurante.
   Quando um cliente (frontend) chega ao dashboard, a sua principal função
   é olhar para o "crachá" do cliente (o token JWT) e, com base no seu cargo
   (SUPERVISOR ou OPERATOR), entregar-lhe o "cardápio" correto com as opções
   que ele tem permissão para ver (ex: 'processo', 'relatorio').*/

import express from 'express';
/* Importamos o nosso "segurança de porta" para garantir que apenas utilizadores
   logados podem acessar a estas rotas.*/
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

/*  ROTA PARA OBTER AS OPÇÕES DO DASHBOARD 
   Define a rota GET /options. O nosso server.js principal irá mapear isto para
   o endereço final que o frontend irá chamar: /dashboard/options
   Note que `authenticateToken` é passado aqui. Isto é crucial. Significa que
   antes de qualquer código nosso ser executado, o "segurança" (authenticateToken)
   irá primeiro verificar o crachá (token) do utilizador.*/
router.get('/options', authenticateToken, (req, res) => {
  // Relação com o Middleware 
  /* Se o código chegou até este ponto, é porque o 'authenticateToken' fez o seu
   trabalho: o token é válido e não expirou. Mais importante, o middleware
   já decodificou o token e anexou os dados do utilizador ao objeto `req.user`.*/

  // Pegamos a função (role) do utilizador que foi extraída do token.
  const userRole = req.user.role;

  // Preparamos um "cardápio" vazio. Vamos adicionar os itens a que o utilizador tem direito.
  let availableOptions = [];

  // Aqui, o backend define as REGRAS de negócio. É o cérebro da aplicação.

  // Se o crachá do utilizador disser "SUPERVISOR"...
  if (userRole === 'SUPERVISOR') {
    // então o seu cardápio terá as opções 'relatorio' e 'processo'.
    availableOptions = ['relatorio', 'processo'];
  }
  // Caso contrário, se o crachá disser "OPERATOR"
  else if (userRole === 'OPERATOR') {
    // então o seu cardápio terá apenas a opção 'processo'.
    availableOptions = ['processo'];
  }

  //  Relação com o Frontend 
  /* Enviamos o "cardápio" finalizado de volta para o frontend.
   O frontend receberá um JSON como: { "options": ["relatorio", "processo"] }
   Com esta resposta, o código do frontend saberá exatamente quais botões
   deve desenhar no ecrã para este utilizador específico.*/
  res.status(200).json({ options: availableOptions });
});

// Exportamos o router para que o nosso 'server.js' principal possa usá-lo.
export default router;

