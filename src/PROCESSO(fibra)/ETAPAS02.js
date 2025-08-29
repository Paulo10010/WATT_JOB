import React, { useState } from 'react';
import OptionCard from '../PROCESSO(armazenamento)/CardSeleção'; // Importa o cartão reutilizável
import styles from '../PROCESSO(armazenamento)/ETAPAS.module.css'; // Importa nossos estilos
import Logo from '../assets/LOGO.jpg';
import FibraIcon from '../assets/Fibra.png';



function ETAPAS02() {
    const [isVisible, setIsVisible] = useState(true);
    // 1. NOVO ESTADO para guardar qual armazém foi selecionado ('A' ou 'B')
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    // 2. ABRIMOS MÃO DESTE ESTADO POR ENQUANTO, o botão "Seguinte" cuidará disso
    // const [nextPopup, setNextPopup] = useState(null);

    // 3. ATUALIZE a função de clique para apenas definir o armazém selecionado
    const handleWarehouseSelect = (warehouse) => {
        console.log(`Armazém "${warehouse}" selecionado.`);
        setSelectedWarehouse(warehouse);
    };

    const handleNextStep = () => {
        if (selectedWarehouse) {
            console.log(`Avançando para a próxima etapa com o ${selectedWarehouse}`);
            // Aqui você colocaria a lógica para abrir o próximo popup/etapa
            // Ex: setNextPopup(selectedWarehouse);
        }
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
  
    return (
      <div className={styles.modalOverlay} onClick={handleClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <header className={styles.modalHeader}>
            <img src={Logo} alt="Logo da Empresa" className={styles.logo} />
            <div className={styles.modalTitle}>
              Qual armazém de destino?
            </div>
            <button className={styles.closeButton} onClick={handleClose}>
              &times;
            </button>
          </header>

          <div className={styles.optionsContainer}>
            <OptionCard 
              title="20cm" 
              imageUrl={FibraIcon} 
              onClick={() => handleWarehouseSelect('20cm')}
              isSelected={selectedWarehouse === '20cm'}
            />
            <OptionCard 
              title="40cm" 
              imageUrl={FibraIcon} 
              onClick={() => handleWarehouseSelect('B')}
              isSelected={selectedWarehouse === 'B'}
              headerColor="#4B7AB4"
              headerTextColor="#FFFFFF" 
            />
          </div>
          
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: selectedWarehouse ? '66%' : '33%',
                transition: 'width 0.5s ease'
              }}
            ></div>
          </div>

          {/* Footer fixo no canto inferior direito */}
          <div className={styles.popupFooterFixed}>
            <button 
              className={styles.nextButton} 
              onClick={handleNextStep}
              disabled={!selectedWarehouse}
            >
              Seguinte
            </button>
          </div>
        </div>
      </div>
    );
}
export default ETAPAS02;