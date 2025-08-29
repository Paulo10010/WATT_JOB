

import React, { useState } from 'react';
import OptionCard from './OptionCard'; // Importa o cartão reutilizável
import styles from './OperationModal.module.css'; // Importa nossos estilos

// Importe suas imagens/ícones aqui
import Logo from '../assets/LOGO.jpg';
import RelatorioIcon from '../assets/relatorio.png';
import ProcessoIcon from '../assets/processo.png';

function OperationModal() {
  // ADICIONAMOS um estado interno para controlar a visibilidade.
  // Ele começa como 'true', fazendo o modal aparecer assim que for renderizado.
  const [isVisible, setIsVisible] = useState(true);

  const [nextPopup, setNextPopup] = useState(null);

  const handleOptionClick = (option) => {
    console.log(`Opção "${option}" clicada.`);
    setNextPopup(option);
  };
  
  // Função interna para fechar o modal, que agora altera o estado local.
  const handleClose = () => {
    setIsVisible(false);
    // Opcional: Adicione um delay para animação de saída antes de "destruir" o componente
  };

  // Agora, verificamos o estado interno 'isVisible' em vez da prop 'isOpen'.
  if (!isVisible) {
    return null;
  }
  
  // A lógica para os popups secundários permanece a mesma
  if (nextPopup === 'relatorio') {
    return (
      <div className={styles.modalOverlay}>
         <div className={styles.modalContent}>
            <h2>Popup de Relatório</h2>
            <p>Conteúdo específico do relatório aqui...</p>
            <button onClick={() => setNextPopup(null)}>Voltar</button>
         </div>
      </div>
    );
  }

  if (nextPopup === 'processo') {
    return (
      <div className={styles.modalOverlay}>
         <div className={styles.modalContent}>
            <h2>Popup de Processo</h2>
            <p>Conteúdo específico do processo aqui...</p>
            <button onClick={() => setNextPopup(null)}>Voltar</button>
         </div>
      </div>
    );
  }

  return (
    // O onClick do overlay agora chama a função interna handleClose
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <img src={Logo} alt="Logo da Empresa" className={styles.logo} />
          <div className={styles.modalTitle}>
          Qual operação você quer realizar hoje?
        </div>
          {/* O botão de fechar também chama a função interna handleClose */}
          <button className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>
        </header>

        

        <div className={styles.optionsContainer}>
          <OptionCard 
            title="Relatório" 
            imageUrl={RelatorioIcon} 
            onClick={() => handleOptionClick('relatorio')}
          />
          <OptionCard 
            title="Processo" 
            imageUrl={ProcessoIcon} 
            onClick={() => handleOptionClick('processo')}
          />
        </div>
      </div>
    </div>
  );
}

export default OperationModal;