
import Login from './LOGIN/Login';
import React, { useState } from 'react';
import MENU from './MENU/MENU';
import ETAPAS from './PROCESSO(armazenamento)/ETAPAS';
import ETAPAS02 from './PROCESSO(fibra)/ETAPAS02';
import ETAPAS03 from './PROCESSO(tamanho)/ETAPA03';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  // This function will be called when the login is successful (e.g., when the user presses Enter)
  const handleLoginSuccess = () => {
    setCurrentScreen('operation');
  };

  return (
    <MENU />
  );
}

export default App;
