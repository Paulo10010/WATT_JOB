// FiberSize.js
import React, { useState } from "react";
import styles from '../PROCESSO(armazenamento)/ETAPAS.module.css';
import Logo from "../assets/LOGO.jpg";

function FiberSize() {
  
  const handleNextStep = () => {
        if (customSize) {
            console.log(`Avançando para a próxima etapa com o ${customSize}`);
            // Aqui você colocaria a lógica para abrir o próximo popup/etapa
            // Ex: setNextPopup(selectedWarehouse);
        }
    };
  
  // O estado 'selected' foi removido, pois não há mais opções para selecionar.
  const [customSize, setCustomSize] = useState("");

  // A função 'handleSelect' foi removida.

  // A função de validação para o input continua a mesma.
  const handleCustomSizeChange = (e) => {
    const value = e.target.value;
    if (value === "" || Number(value) > 0) {
      setCustomSize(value);
    }
  };

  const handleClose = () => {
    console.log("Fechando modal...");
  };

  // Lógica do botão foi simplificada: ele só depende se o campo está preenchido.
  const isNextDisabled = customSize.trim() === "";

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <header className={styles.modalHeader}>
            <img src={Logo} alt="Logo da Empresa" className={styles.logo} />
            <div className={styles.modalTitle}>
              Qual o tamanho da fibra?
            </div>
            <button className={styles.closeButton} onClick={handleClose}>
              &times;
            </button>
          </header>
<div className={styles.stepContent}>
          

          {/* O container com os cartões foi removido. */}
          {/* O input agora é exibido diretamente. */}
          <input
            type="number"
            placeholder="Digite o tamanho em cm"
            className={styles.inputBox}
            value={customSize}
            onChange={handleCustomSizeChange}
            min="1" // Garante que apenas números maiores que zero sejam válidos
            autoFocus
          />
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{
              width: customSize ? '100%' : '66%',
              transition: 'width 0.5s ease'
            }}
          ></div>
          </div>

        {/* Footer fixo no canto inferior direito */}
        <div className={styles.popupFooterFixed}>
          <button
            className={styles.nextButton}
            onClick={handleNextStep}
            disabled={!customSize}
            >
              Seguinte
            </button>
          </div>
        </div>
      </div>
  );
}

export default FiberSize;