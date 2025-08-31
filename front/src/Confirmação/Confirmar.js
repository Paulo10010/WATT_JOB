// ConfirmationModal.js
import React, { useState } from 'react'; // Importe o useState
import styles from './ConfirmationModal.module.css';
import Logo from '../assets/LOGO.jpg';
// As props foram removidas da declaração da função
function ConfirmationModal() {
  // 1. O estado para controlar a visibilidade agora está DENTRO do componente
  const [isVisible, setIsVisible] = useState(true);

  // 2. Os dados de exemplo agora são uma constante DENTRO do componente
  const selectedData = {
    warehouse: 'A',
    fiberDiameter: '20 cm',
    fiberSize: '65 cm'
  };

  // 3. As funções de controle agora estão DENTRO do componente
  const handleConfirmData = () => {
    console.log("Dados confirmados!", selectedData);
    // Aqui você faria a chamada final para a API, etc.
    setIsVisible(false); // Fecha o modal alterando o estado interno
  };

  const handleCloseModal = () => {
    console.log("Modal fechado sem confirmar.");
    setIsVisible(false); // Fecha o modal alterando o estado interno
  };

  // 4. Adicionamos esta verificação para fazer o componente "desaparecer" quando for fechado
  if (!isVisible) {
    return null;
  }

  return (
    // O onClick agora chama a função interna
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <header className={styles.modalHeader}>
          <img src={Logo} alt="Logo da Empresa" className={styles.logo} />
          <div className={styles.modalTitle}>Confirmação dos dados</div>
          {/* O onClick agora chama a função interna */}
          <button className={styles.closeButton} onClick={handleCloseModal}>
            &times;
          </button>
        </header>

        <div className={styles.confirmationBody}>
          <div className={styles.dataGroup}>
            <label className={styles.label}>ARMAZÉM:</label>
            {/* 5. O JSX agora usa o objeto de dados interno */}
            <div className={styles.dataBox}>{selectedData.warehouse}</div>
          </div>

          <div className={styles.dataGroup}>
            <label className={styles.label}>FIBRAS:</label>
            <div className={styles.subGroup}>
              <div className={styles.subData}>
                <label className={styles.subLabel}>Diâmetro</label>
                <div className={styles.dataBox}>{selectedData.fiberDiameter}</div>
              </div>
              <div className={styles.subData}>
                <label className={styles.subLabel}>Tamanho</label>
                <div className={styles.dataBox}>{selectedData.fiberSize}</div>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          {/* O onClick agora chama a função interna */}
          <button className={styles.confirmButton} onClick={handleConfirmData}>
            Confirmar
          </button>
        </footer>

      </div>
    </div>
  );
}

export default ConfirmationModal;