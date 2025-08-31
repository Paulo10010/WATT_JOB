/*
 GESTOR DE ROTAS DE AUTENTICAÇÃO
"recepção" da sua aplicação. Ele lida com todas as tarefas relacionadas
 à identidade do utilizador: criar uma conta nova,
 verificar as credenciais para entrar, e processar a saída.
*/

import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
// Importamos os nossos "seguranças" do ficheiro de middleware.
// 'authenticateToken' é o verificador de crachá geral.
// 'authorizeRole' é o verificador de nível de acesso (ex: só supervisores).
import authenticateToken, { authorizeRole } from '../middleware/authenticateToken.js';
// Importamos a função para invalidar o token da nossa blocklist em memória.
import { invalidateToken } from '../middleware/tokenBlocklist.js';

const router = express.Router();

/*  ROTA DE CADASTRO (SIGNUP) 
 Esta rota é usada para criar novos utilizadores no sistema.
 É uma rota protegida, pois definimos que apenas um supervisor pode criar novas contas.*/
router.post('/signup', [authenticateToken, authorizeRole('SUPERVISOR')], async (req, res) => {
  /*  Relação com o Frontend 
   O frontend deve chamar esta rota com o método POST. No cabeçalho da requisição,
   ele DEVE enviar o token de um supervisor logado. No corpo (body), ele envia
   os dados do novo utilizador que esta sendo criado.  */

  // Extraímos os dados que o frontend enviou no corpo da requisição.
  const { name, cpf, password, confirmPassword, role } = req.body;

  /*  Validações de Segurança e Consistência no Backend 
      Nunca confiamos apenas no frontend. O backend sempre faz as suas próprias validações.*/

  // Garante que nenhum campo essencial está em falta.
  if (!name || !cpf || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Garante que o utilizador não cometeu um erro de digitação ao inserir a senha.
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }

  // Garante que a função (role) enviada é uma das opções válidas.
  if (role !== 'OPERATOR' && role !== 'SUPERVISOR') {
    return res.status(400).json({ error: 'Função (role) inválida.' });
  }

  try {
    // Usamos o Prisma para criar um novo registo na tabela 'user'.
    const user = await prisma.user.create({
      data: {
        name,
        cpf,
        password: password, // <-- Salva a senha diretamente (sem criptografia)
        role,
      },
    });

    /* Se tudo correr bem, enviamos uma resposta de sucesso (201 Created).
       o 'createdBy' serve para fins de auditoria, mostrando qual supervisor criou a conta.*/
    res.status(201).json({ message: `Usuário '${user.name}' criado com sucesso!`, createdBy: req.user.userId });

  } catch (error) {
    // Se o Prisma retornar o código 'P2002', significa que o CPF já existe.
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este CPF já está cadastrado.' });
    }
    // Para qualquer outro erro inesperado.
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao criar o usuário.' });
  }
});


/*  ROTA DE LOGIN (COM JWT) 
   Esta é a porta de entrada da aplicação. Não é protegida por middleware.*/
router.post('/login', async (req, res) => {
  //  Relação com o Frontend 
  // O frontend envia o CPF e a senha que o utilizador digitou no formulário de login.
  const { cpf, password } = req.body;
  const genericError = { error: 'CPF ou senha inválidos.' };

  // Validação básica para garantir que os campos foram enviados.
  if (!cpf || !password) {
    return res.status(401).json(genericError);
  }

  try {
    // Procuramos na base de dados por um utilizador com o CPF fornecido.
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    // Verificamos se o utilizador existe e se a senha fornecida é igual à guardada.
    const isPasswordValid = user ? (password === user.password) : false;

    // Se a senha for inválida (ou o utilizador não existir), enviamos um erro genérico.
    // Nunca dizemos ao frontend se foi o utilizador ou a senha que falhou, por segurança.
    if (!isPasswordValid) {
      return res.status(401).json(genericError);
    }

    // Se as credenciais estiverem corretas, preparamos o "crachá" (payload do token).
    const payload = {
      userId: user.id,
      role: user.role,
    };

    // Criamos o token JWT, assinando o payload com a nossa chave secreta e definindo uma validade.
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Enviamos a resposta de sucesso para o frontend, incluindo o token.
    // O frontend deve guardar este token para usar em requisições futuras.
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });
  } catch (error) {
    console.error('Erro inesperado no login:', error);
    return res.status(401).json(genericError);
  }
});


//  ROTA DE LOGOUT 
// Esta rota permite que um utilizador invalide o seu token de sessão.
router.post('/logout', authenticateToken, (req, res) => {
  /*  Relação com o Frontend 
     Quando o utilizador clica em "Sair", o frontend deve chamar esta rota,
     enviando o token atual no cabeçalho 'Authorization'.*/
  try {
    // Extraímos o token do cabeçalho.
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    /* Usamos a nossa função do 'tokenBlocklist' para adicionar este token
       à lista de "bilhetes cancelados".*/
    invalidateToken(token);

    // Enviamos uma resposta de sucesso para o frontend.
    res.status(200).json({ message: 'Logout realizado com sucesso. O token foi invalidado.' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Não foi possível realizar o logout.' });
  }
});

// Exportamos o router para que o nosso 'server.js' principal possa usá-lo.
export default router;

