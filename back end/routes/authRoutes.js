import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

// --- MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO (SUPERVISOR) ---
// Este middleware permanece igual, pois ele verifica o token, não a senha.
const isSupervisor = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    if (decodedPayload.role !== 'SUPERVISOR') {
      return res.status(403).json({ error: 'Acesso negado. Apenas supervisores podem realizar esta ação.' });
    }

    req.user = decodedPayload;
    next();
  });
};


// --- ROTA DE CADASTRO (SIGNUP) - APENAS PARA SUPERVISORES ---
router.post('/signup', isSupervisor, async (req, res) => {
  const { name, cpf, password, confirmPassword, role } = req.body;

  if (!name || !cpf || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }

  if (role !== 'OPERATOR' && role !== 'SUPERVISOR') {
    return res.status(400).json({ error: 'Função (role) inválida.' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        cpf,
        password: password, // <-- Salva a senha diretamente
        role,
      },
    });

    res.status(201).json({ message: `Usuário '${user.name}' criado com sucesso!`, createdBy: req.user.userId });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este CPF já está cadastrado.' });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao criar o usuário.' });
  }
});


// --- ROTA DE LOGIN (COM JWT) ---
router.post('/login', async (req, res) => {
  const { cpf, password } = req.body;
  const genericError = { error: 'CPF ou senha inválidos.' };

  if (!cpf || !password) {
    return res.status(401).json(genericError);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    // Agora fazemos uma comparação direta de texto (string === string)
    const isPasswordValid = user ? (password === user.password) : false;

    if (!isPasswordValid) {
      return res.status(401).json(genericError);
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });
  } catch (error) {
    console.error('Erro inesperado no login:', error);
    return res.status(401).json(genericError);
  }
});


export default router;

