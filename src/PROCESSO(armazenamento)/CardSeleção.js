// src/components/ETAPAS/CardSeleção.jsx

import React from 'react';
import styles from './ETAPAS.module.css';

// 1. Adicionamos a nova prop `headerTextColor` na lista
function OptionCard({ title, imageUrl, onClick, headerColor, headerTextColor, isSelected }) {
  
  const cardClasses = `${styles.optionCard} ${isSelected ? styles.selected : ''}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      <div 
        className={styles.cardHeader} 
        // 2. Adicionamos a propriedade 'color' ao objeto de estilo
        style={{ 
          backgroundColor: headerColor, 
          color: headerTextColor,
          fontSize: '3.6rem'
        }}
      >
        {title}
      </div>
      <div className={styles.cardBody}>
        <img src={imageUrl} alt={`Ícone de ${title}`} className={styles.cardImage} />
      </div>
    </div>
  );
}

export default OptionCard;