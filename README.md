<<<<<<< HEAD
# Projeto de Automação para Processo Seletivo WATT

## Visão Geral do Projeto

[cite_start]Este projeto tem como objetivo principal a criação de uma aplicação web funcional, transformando protótipos em uma aplicação web funcional[cite: 58]. [cite_start]A implementação requer um frontend em ReactJS e um backend em Node.js, integrado a um banco de dados PostgreSQL através do Prisma ORM[cite: 59].

## Gerenciamento do Projeto

[cite_start]Um membro da equipe da WATT Consultoria participará de nosso grupo para auxiliar no gerenciamento e tirar dúvidas quando necessário[cite: 74]. [cite_start]A comunicação diária entre a equipe é essencial para o sucesso do projeto[cite: 53].

## Configuração do Ambiente

Para rodar o projeto localmente, siga os seguintes passos:

1.  Pré-requisitos:
    -   Node.js (versão 18.x ou superior)
    -   PostgreSQL (versão 15.x ou superior)

2.  Configuração do Banco de Dados:
    -   Crie um banco de dados PostgreSQL com o nome `watt_job`.
    -   Crie um arquivo `.env` na raiz do projeto com a seguinte URL de conexão:
        `DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/watt_job?schema=public"`

3.  Instalação das Dependências:
    -   Rode o comando `npm install` no terminal para instalar todas as bibliotecas do projeto.

4.  Executar as Migrações do Prisma:
    -   Rode o comando `npx prisma migrate dev --name init` para criar as tabelas no banco de dados.

## Credenciais de Teste

Para testar o fluxo de autenticação, os seguintes usuários foram criados diretamente no banco de dados para acelerar os testes:

Supervisor: `supervisor@mail.com` / `senha123`
Operário: `operario@mail.com` / `senha123`

## Contribuição

* [cite_start]Frontend Dev:Paulo Tito [cite: 49]
* [cite_start]Backend Devs: Gustavo e Tauan [cite: 50]
* [cite_start]DB Dev: Paulo Teodoro [cite: 51]
=======
# WATT_JOB
Criando um site para o protótipo criado no figma.
>>>>>>> 132e48b4fb1d2a9c031d0cdb5dcfe6e45ae8c7a3
