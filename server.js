import express from 'express'

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

import cors from 'cors';

const prisma = new PrismaClient().$extends(withAccelerate())

const app = express()

app.use(express.json())

app.use(cors());

/*
app.post('/users',async (req, res) => {
    //criar usuario
    await prisma.user.create({
        data: {
            cpf: req.body.cpf,
            name: req.body.name,
            password: req.body.password,
            role: req.body.role
        }
    })

    res.status(201).json(req.body)})

//get=listar
app.get('/users', async (req, res) => {

    const users = await prisma.user.findMany()
    
    res.status(200).json(users)
})
*/

//login
app.post('/login', async (req, res) => {
  try {
    const { cpf, password } = req.body;

    // Tenta encontrar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        cpf: cpf,
      },
    });

    // Apenas UMA condição para o sucesso:
    // O usuário deve existir E a senha deve ser igual.
    if (user && user.password === password) {
      // CASO DE SUCESSO
      // Prepara a resposta sem a senha do usuário
      const userResponse = {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role,
      };

      // Retorna a resposta de sucesso
      return res.status(200).json({ message: 'Login bem-sucedido!', user: userResponse });
    }

    // CASO DE FALHA (para qualquer outro cenário)
    // Se o usuário não existir ou a senha estiver errada,
    // ele cairá aqui e retornará o erro genérico.
    return res.status(401).json({ error: 'CPF ou senha inválidos.' });

  } catch (error) {
    // Se ocorrer um erro inesperado no servidor (ex: banco fora do ar),
    // também retornamos o mesmo erro genérico para o usuário final.
    console.error('Erro inesperado durante o login:', error);
    return res.status(401).json({ error: 'CPF ou senha inválidos.' });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});

//app.listen(3000)