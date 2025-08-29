import express from 'express';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Importa as novas rotas do dashboard que criamos
import dashboardRoutes from './routes/dashboard.js';

// Configura o dotenv para ler o arquivo .env
dotenv.config();

const prisma = new PrismaClient().$extends(withAccelerate());
const app = express();

app.use(express.json());
app.use(cors());

// --- ROTA DE LOGIN (COM JWT) ---
app.post('/auth/login', async (req, res) => {
  const { cpf, password } = req.body;
  const genericError = { error: 'CPF ou senha inválidos.' };

  // Validação de entrada: Garante que CPF e senha foram enviados.
  if (!cpf || !password) {
    return res.status(401).json(genericError);
  }

  try {
    // 1. Busca o usuário no banco de dados pelo CPF.
    const user = await prisma.user.findUnique({
      where: { cpf },
    });

    // 2. Compara a senha enviada (texto puro) com a senha no banco (texto puro).
    //    Se 'user' for nulo, a primeira parte (user ?) falha e o resultado é 'false'.
    const isPasswordValid = user ? (password === user.password) : false;

    // 3. Lógica de Sucesso ou Erro Genérico:
    //    Se a senha for inválida (ou o usuário não existir), retorna o erro.
    if (!isPasswordValid) {
      return res.status(401).json(genericError);
    }

    // --- SUCESSO NO LOGIN ---

    // 4. Define o conteúdo (Payload) do token com os dados necessários para o frontend.
    const payload = {
      userId: user.id, // Identificação do usuário
      role: user.role,   // Função/Role para controle de acesso e redirecionamento
    };

    // 5. Gera o token JWT.
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // Chave secreta do arquivo .env
      {
        expiresIn: '12h', // Duração do token. Pode ser ajustado.
      }
    );

    // 6. Envia a resposta de sucesso com o token para o frontend.
    return res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token
    });

  } catch (error) {
    // Para qualquer outro erro inesperado no servidor, retorna o mesmo erro genérico.
    console.error('Erro inesperado no login:', error);
    return res.status(401).json(genericError);
  }
});

// Delegação de Rotas do Dashboard
// Diz ao Express: "Qualquer requisição que comece com '/dashboard',
// envie para o arquivo 'dashboardRoutes' para ser processada."
app.use('/dashboard', dashboardRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});
