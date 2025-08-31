import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // Importa nossas rotas de autenticação

// Configura o dotenv para ler o arquivo .env
dotenv.config();

const app = express();

// Middlewares globais que se aplicam a todas as requisições
app.use(express.json()); // Permite que o servidor entenda o formato JSON
app.use(cors()); // Habilita a comunicação entre diferentes origens (frontend e backend)

/*  DELEGAÇÃO DAS ROTAS DE AUTENTICAÇÃO 
   Esta linha é a principal: ela diz ao Express que para qualquer
   requisição que comece com o caminho '/auth' (como /auth/login),
   a responsabilidade de lidar com ela é do arquivo 'authRoutes.js'.*/
app.use('/auth', authRoutes);

// Rota de dashboard
import dashboardRoutes from './routes/dashboard.js';
app.use('/dashboard', dashboardRoutes);

//rota de processos
import processRouter from './routes/processRouter.js';
app.use('/process', processRouter);

//rota de relatórios
import reportRoutes from './routes/reportRoutes.js';
app.use('/reports', reportRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});

