import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // O frontend deve enviar o token no cabeçalho 'Authorization'
  // no formato: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Se não houver token, o acesso é negado.
  if (token == null) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // O servidor verifica se o token é autêntico usando a chave secreta.
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    // Se o token for inválido (assinatura errada) ou expirado, o acesso é negado.
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, o payload decodificado (com userId e role)
    // é adicionado ao objeto da requisição para ser usado na próxima etapa.
    req.user = decodedPayload;
    next(); // Permite que a requisição continue para a rota final.
  });
};

export default authenticateToken;

