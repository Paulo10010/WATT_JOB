// ProgressScreen.js
import React, { useState, useEffect } from 'react';
import styles from './ProgressScreen.module.css';
import Logo from '../assets/LOGO.jpg'; // Importe seu logo
import confirm from '../assets/confimation.png';

function ProgressScreen() {
  // Estado para controlar a porcentagem da barra (0 a 100)
  const [progress, setProgress] = useState(0);
  
  // Estado para controlar o status do processo: 'running', 'stopped', 'completed'
  const [status, setStatus] = useState('running');

  // useEffect é usado para controlar a animação da barra (efeitos colaterais)
  useEffect(() => {
    // Se o status não for 'running', não faz nada
    if (status !== 'running') {
      return;
    }

    // Define um temporizador (intervalo) para atualizar o progresso
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer); // Para o temporizador
          setStatus('completed'); // Muda o status para completo
          return 100;
        }
        // Incrementa o progresso. 100 / 15 segundos = ~6.67 por segundo
        return prevProgress + (100 / 150); // (100% / 150 passos de 100ms = 15s)
      });
    }, 100); // Atualiza a cada 100ms para uma animação suave

    // Função de limpeza: Isso é MUITO IMPORTANTE!
    // Ela é executada quando o componente é desmontado ou o status muda,
    // evitando que o temporizador continue rodando em segundo plano.
    return () => {
      clearInterval(timer);
    };
  }, [status]); // Este useEffect depende do 'status'. Ele re-executa se o status mudar.

  const handleStop = () => {
    setStatus('stopped');
  };
  
  const handleClosePopup = () => {
    // Reseta o estado para recomeçar, se necessário
    setProgress(0);
    setStatus('running'); 
  };

  // Define a mensagem do popup com base no status
  let popupMessage = '';
  if (status === 'completed') {
    popupMessage = 'Processo terminado com sucesso!';
  } else if (status === 'stopped') {
    popupMessage = 'O processo foi parado pelo usuário.';
  }

  const [showNotifyPopup, setShowNotifyPopup] = useState(false);

  const handleNotifySupervisor = () => {
    setShowNotifyPopup(true);
  };

  const handleCloseNotifyPopup = () => {
    setShowNotifyPopup(false);
    handleClosePopup();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.screenContainer}>
        <img src={Logo} alt="Logo" className={styles.logo} />

        <div className={styles.mainScreen}>
          <div className={styles.progressBox}>
            <h3>Progresso:</h3>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <button onClick={handleStop} className={styles.stopButton}>Parar</button>
        </div>

        {status === 'completed' && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <header className={styles.popupHeaderConclusion}>
                <h2>Concluído com sucesso</h2>
              </header>
              <div className={styles.popupBodyConclusion}>
                <p className={styles.popupMessageConclusion}>Processo terminado com sucesso!</p>
              </div>
              <button onClick={handleClosePopup} className={styles.popupButtonConclusion}>OK</button>
            </div>
          </div>
        )}
        {status === 'stopped' && !showNotifyPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
               <header className={styles.popupHeaderstop}>
                <h2>Alerta!</h2>
              </header>
              <p>O processo foi parado pelo usuário.</p>
              <button onClick={handleClosePopup} className={styles.popupButtonstop}>Fechar</button>
              <button onClick={handleNotifySupervisor} className={styles.popupButtonNotify}>Notificar supervisor</button>
            </div>
          </div>
        )}
        {showNotifyPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <header className={styles.popupHeaderNotify}>
                <h2>Supervisor Notificado</h2>
              </header>
              <p>O supervisor foi notificado sobre a parada do processo.</p>
              <button onClick={handleCloseNotifyPopup} className={styles.popupButtonNotify}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressScreen;