import React, { useState } from 'react';
import style from "./Login.module.css";
import profilepic from '../assets/LOGO.jpg';

function Login() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // The single, correct handleLogin function
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevents the form from reloading the page

    try {
      const response = await fetch('http://sua-api.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, password }),
      });

      if (response.ok) {
        // Login successful, close the popup if it's open
        setShowPopup(false);
        // Add your logic for a successful login here (e.g., redirect)
        alert('Login bem-sucedido!'); // You can use a better method
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Sua senha ou CPF estão incorretos.");
        setShowPopup(true); // Show the popup
      }
    } catch (error) {
      setErrorMessage("Ocorreu um erro na requisição. Tente novamente mais tarde.");
      setShowPopup(true); // Show the popup for network errors
    }
  };

  return (
    <>
      {showPopup && (
        <div className={style.popupOverlay}>
          <div className={style.popupContent}>
            <p>{errorMessage}</p>
            <button onClick={() => setShowPopup(false)}>Fechar</button>
          </div>
        </div>
      )}

      <div>
        <img className={style.cardimage} src={profilepic} alt="LOGO"></img>
      </div>
      <div className={style.loginContainer}>
        <div className={style.loginBox}>
          <h2 className={style.welcome}>Bem vindo de volta!</h2>
          <form className={style.loginForm} onSubmit={handleLogin}>
            <div className={style.inputGroup}>
              <label htmlFor="cpf"></label>
              <input
                type="text"
                id="cpf"
                placeholder="CPF"
                className={style.GroupInput}
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
            <div className={style.inputGroup}>
              <label htmlFor="password"></label>
              <input
                type="password"
                id="password"
                placeholder="Senha"
                className={style.GroupInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={style.loginBtn}>
              Entrar
            </button>
            <div>
              <a href="/recuperar-senha" className={style.caixaRecuSenha}>
                Esqueceu a senha?
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;