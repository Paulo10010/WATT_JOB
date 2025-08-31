import jwt from 'jsonwebtoken';

/* 
 GESTOR DA BLOCKLIST DE TOKENS
 Pense neste ficheiro como a "lousa de bilhetes cancelados" do porteiro do cinema.
 Quando um utilizador faz logout, o seu "bilhete" (token) é anotado aqui.
 Isto impede que o bilhete seja reutilizado, mesmo que a sua data de validade
 ainda não tenha passado.
 Para evitar que a lousa fique infinitamente cheia, temos um sistema de
 limpeza automática que apaga os bilhetes que já expiraram.
 Usamos um 'Map' em vez de um array ou Set simples porque ele é otimizado para
 buscas rápidas e permite-nos associar um valor (a data de expiração) a cada
 chave (o token). Isto é crucial para a nossa rotina de limpeza.
*/
 const tokenBlocklist = new Map();


/*
  Adiciona um token à nossa lousa de invalidados.
  Esta função é chamada pela rota de logout.
  A rota `POST /auth/logout` irá chamar esta função, passando o token
  do utilizador que deseja sair da sessão.
 
  @param {string} token - O token JWT a ser invalidado.*/
export const invalidateToken = (token) => {
  // Uma verificação simples para garantir que não tentamos adicionar nada vazio.
  if (!token) return;

  /* Para sabermos quando podemos limpar este token da nossa lista, primeiro
     precisamos de ler a sua data de validade original. `jwt.decode` faz isso
     sem precisar de verificar a assinatura.*/
  const decoded = jwt.decode(token);

  // A especificação JWT diz que a data de expiração ('exp') está em SEGUNDOS.
  // O JavaScript trabalha com MILISSEGUNDOS, então precisamos converter.
  if (decoded && decoded.exp) {
    const expirationTime = decoded.exp * 1000; // Converte para milissegundos
    
    // Anota na nossa "lousa": o número do bilhete e a sua data de validade.
    tokenBlocklist.set(token, expirationTime);
  }
};


/*
  Verifica se um token está na nossa lousa de invalidados.
  O middleware `authenticateToken` irá chamar esta função para cada
  requisição recebida. É o primeiro passo de segurança: "Este bilhete
  já foi cancelado?".
 
  @parameter {string} token - O token JWT a ser verificado.
  @returns {boolean} - Retorna `true` se o token estiver na blocklist.
 */
export const isTokenBlocklisted = (token) => {
  // `Map.has()` é uma operação extremamente rápida para verificar se um item existe.
  return tokenBlocklist.has(token);
};


/*
  O "serviço de limpeza" automático.
  Esta função corre em segundo plano para manter a blocklist pequena e eficiente.
 */
const cleanupExpiredTokens = () => {
  // Pega a hora atual em milissegundos.
  const now = Date.now();
  console.log(`[Blocklist Cleanup] Verificando tokens expirados... Tamanho da blocklist: ${tokenBlocklist.size}`);
  
  // Percorre cada token na nossa lousa.
  for (const [token, expirationTime] of tokenBlocklist.entries()) {
    // A pergunta chave: A data de validade deste bilhete já passou?
    if (expirationTime <= now) {
      // Se sim, ele já é inválido por si só. Podemos apagá-lo da lousa para libertar memória.
      tokenBlocklist.delete(token);
    }
  }
};

/* Agenda a execução da nossa função de limpeza para correr periodicamente.
   `setInterval` irá chamar `cleanupExpiredTokens` a cada 30 minutos (1800000 ms).
   Este intervalo garante que a nossa lista na memória nunca crescerá indefinidamente,
   resolvendo o problema de performance com muitos logouts.*/
setInterval(cleanupExpiredTokens, 1800000);

