import React, { useState } from 'react';
import styles from './CadastroUsuario.module.css';

function CadastroUsuario() {
  // Estados para os dados do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [role, setRole] = useState(null); // 'supervisor' ou 'operador'

  // Estados para controle da UI (interface do usuário)
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  /**
   * Lida com o envio do formulário, validações e chamada da API.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError(null); // Limpa erros anteriores

    // Validações no lado do cliente
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    if (!role) {
      alert("Por favor, selecione um cargo.");
      return;
    }

    setIsLoading(true); // Inicia o feedback de carregamento

    try {
      // Prepara o corpo da requisição para a API
      const userData = { nome, cpf, senha, cargo: role };

      // Envia os dados para o backend (substitua pela sua URL real)
      const response = await fetch('http://sua-api.com/usuarios/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      // Trata a resposta do backend
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no cadastro.');
      }

      // Se tudo deu certo
      alert('Funcionário cadastrado com sucesso!');
      // Limpa o formulário
      setNome('');
      setCpf('');
      setSenha('');
      setConfirmarSenha('');
      setRole(null);

    } catch (error) {
      // Captura erros de rede ou da resposta da API
      console.error("Erro ao cadastrar:", error);
      setApiError(error.message);
      alert(`Erro: ${error.message}`); // Mostra um feedback de erro para o usuário
    } finally {
      // Garante que o estado de carregamento seja desativado
      setIsLoading(false);
    }
  };

  // Lógica para desabilitar o botão de envio
  const isFormInvalid = !nome || !cpf || !senha || !confirmarSenha || !role;

  return (
    <div className={styles.formContainer}>
      <form className={styles.formBox} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Cadastro de funcionário</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="nome">Nome completo</label>
          <input
            type="text"
            id="nome"
            placeholder="Digite seu Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="cpf">CPF</label>
          <input
                type="text"
                id="cpf"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => {
                  // Only allow numbers and max 11 digits
                  const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setCpf(onlyNums);
                }}
                inputMode="numeric"
                pattern="[0-9]{11}"
                maxLength={11}
              />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="senha">Senha</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePasswordButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmarSenha">Confirmar senha</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmarSenha"
              placeholder="Confirma sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePasswordButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className={styles.roleSelection}>
          <button
            type="button"
            className={`${styles.roleButton} ${role === 'supervisor' ? styles.active : ''}`}
            onClick={() => setRole('supervisor')}
          >
            Supervisor
          </button>
          <button
            type="button"
            className={`${styles.roleButton} ${role === 'operador' ? styles.active : ''}`}
            onClick={() => setRole('operador')}
          >
            Operador
          </button>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isFormInvalid || isLoading}
        >
          {isLoading ? 'Cadastrando...' : 'Concluir'}
        </button>
      </form>
    </div>
  );
}

export default CadastroUsuario;