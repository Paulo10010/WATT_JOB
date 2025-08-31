import jwt from 'jsonwebtoken';

/*
 ARQUIVO DE SEGURANÇA DA API
 Pense neste ficheiro como o "segurança na porta".
 Ele tem duas responsabilidades principais:
 1. AUTENTICAÇÃO: Verificar se a pessoa tem um "crachá" (token) válido.
 2. AUTORIZAÇÃO: Verificar se o "crachá" dá permissão para entrar numa sala
    específica (ex: apenas para supervisores).
 1. MIDDLEWARE DE AUTENTICAÇÃO (O Verificador de Crachá)
 Esta função é o middleware principal e mais básico. A sua única
 responsabilidade é responder à pergunta: "Este usuario está logado?".
 Ele será usado em TODAS as rotas que precisam de um utilizador autenticado.*/
const authenticateToken = (req, res, next) => {
  /* O frontend, após o login, deve guardar o token. Para cada
   requisição a uma rota protegida, ele deve enviar esse token
   no cabeçalho 'Authorization', no formato: "Bearer eyJhbGciOi..."*/
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai apenas o token, ignorando "Bearer "

  // Primeira verificação: a pessoa tem um crachá?
  // Se nenhum token for enviado, o acesso é negado imediatamente.
  if (token == null) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  /*Segunda verificação: o crachá é autêntico e não expirou?
    Usamos a chave secreta para verificar a assinatura do token.
    Se a assinatura não corresponder ou se a data de validade já tiver passado,
    a biblioteca 'jsonwebtoken' irá retornar um erro.*/
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    // Se 'err' existir, significa que o token é inválido. Acesso negado.
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    /*SUCESSO! O token é válido.
      Agora, "anexamos" os dados do utilizador (o payload decodificado) ao
      objeto 'req'. É como se o segurança colocasse uma etiqueta de visitante
      na pessoa, com o seu nome e cargo. As rotas seguintes poderão ler esta etiqueta.*/
    req.user = decodedPayload;
    
    /* 'next()' é a palavra-chave que diz: "Ok, a verificação passou. Pode
        continuar para a próxima etapa (outro middleware ou a rota final)".*/
    next();
  });
};

/*
 2. MIDDLEWARE DE AUTORIZAÇÃO (O Verificador de Nível de Acesso)
 Esta não é uma função de middleware, mas sim uma "fábrica" que CRIA
 uma função de middleware. Você diz qual a permissão necessária
 (ex: 'SUPERVISOR'), e ela devolve-lhe um segurança especializado.*/
export const authorizeRole = (allowedRole) => {
  // Esta função interna é o middleware que será realmente executado.
  return (req, res, next) => {
    /* Este segurança assume que o 'authenticateToken' já fez o seu trabalho
     e que a "etiqueta de visitante" (req.user) já foi colocada.*/
    if (!req.user) {
      /* Esta verificação é uma segurança extra, caso se esqueça
       de usar o 'authenticateToken' primeiro.*/
      return res.status(403).json({ error: 'Erro de autenticação.' });
    }

    /* Verificação principal: a função na "etiqueta" do utilizador (req.user.role)
       é a mesma que a função permitida para esta rota?*/
    if (req.user.role !== allowedRole) {
      return res.status(403).json({ error: `Acesso negado. Apenas ${allowedRole.toLowerCase()}s podem realizar esta ação.` });
    }

    // SUCESSO! O utilizador tem a permissão correta.
    // Permite que a requisição continue para a rota final.
    next();
  };
};

/* Exportamos o 'authenticateToken' como padrão porque ele é o mais usado.
   Assim, nos outros ficheiros, podemos continuar a fazer 'import authenticateToken from ...'*/
export default authenticateToken;

