// src/components/MainLayout/Sidebar.js
import React from 'react';
import styles from './MainLayout.module.css';

function Sidebar({ isOpen, onClose, onNavigate }) {
  const handleNavClick = (id, title) => {
    onNavigate(id, title);
    onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Menu</h3>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>
        <nav className={styles.sidebarNav}>
          <button onClick={() => handleNavClick('home', 'Home')}>Início</button>
          <button onClick={() => handleNavClick('relatorios', 'Relatórios')}>Relatórios</button> {/* <-- ADICIONADO AQUI */}
          <button onClick={() => handleNavClick('cadastro', 'Cadastro')}>Cadastro</button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;