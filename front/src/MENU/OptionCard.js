// src/components/OperationModal/OptionCard.jsx

import React from 'react';
import styles from './OperationModal.module.css';

// Componente para os cartões de "Relatório" e "Processo"
function OptionCard({ title, imageUrl, onClick }) {
  return (
    <div className={styles.optionCard} onClick={onClick}>
      <div className={styles.cardHeader}>
        {title}
      </div>
      <div className={styles.cardBody}>
        <img src={imageUrl} alt={`Ícone de ${title}`} className={styles.cardImage} />
      </div>
    </div>
  );
}

export default OptionCard;