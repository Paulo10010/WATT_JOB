// src/components/MainLayout/Header.js
import React from 'react';
import styles from './MainLayout.module.css';

// Recebe a lista de abas e funções para controlar as abas
function Header({ onMenuClick, tabs, activeTab, onTabClick, onTabClose }) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button onClick={onMenuClick} className={styles.menuButton}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mapeia a lista de abas para renderizar cada uma */}
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTab ? styles.activeTab : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span>{tab.title}</span>
            <button
              className={styles.tabCloseButton}
              onClick={(e) => {
                e.stopPropagation(); // Impede que o clique no 'x' também selecione a aba
                onTabClose(tab.id);
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className={styles.rightSection}>
        <button className={styles.mainCloseButton}>&times;</button>
      </div>
    </header>
  );
}

export default Header;