// src/components/MainLayout/MainLayout.js
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import Relatorios from '../Relatorio(relatorio)/Relatorios';  


// Importe suas páginas
import CadastroUsuario from '../Relatorio(cadastro)/CadastroUsuario';

// Conteúdo de exemplo para a Home
const HomePage = () => (
  <div>
    <h1>Página Inicial</h1>
    <p>Bem-vindo ao sistema.</p>
  </div>
);

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado para controlar as abas abertas e a aba ativa
  const [tabs, setTabs] = useState([{ id: 'home', title: 'Home' }]);
  const [activeTab, setActiveTab] = useState('home');

  const openTab = (id, title) => {
    // Se a aba já existe, apenas a torna ativa
    if (tabs.find(tab => tab.id === id)) {
      setActiveTab(id);
      return;
    }
    // Se não existe, adiciona à lista e a torna ativa
    setTabs([...tabs, { id, title }]);
    setActiveTab(id);
  };

  const closeTab = (id) => {
    // Impede que a última aba seja fechada
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === id);
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);

    // Se a aba fechada era a ativa, ativa a aba anterior (ou a primeira)
    if (activeTab === id) {
      setActiveTab(newTabs[tabIndex - 1]?.id || newTabs[0]?.id);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'cadastro':
        return <CadastroUsuario />;
      // Adicione outros casos para 'relatorios', 'historico', etc.
      case 'relatorios': // <-- ADICIONADO AQUI
        return <Relatorios />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={openTab} // A sidebar agora abre abas
      />
      <div className={styles.mainContent}>
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          onTabClose={closeTab}
        />
        <main className={styles.pageContent}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;