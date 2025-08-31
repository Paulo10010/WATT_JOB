
import Login from './LOGIN/Login';
import React, { useState } from 'react';
import OperationModal from './MENU/MENU';
import ETAPAS from './PROCESSO(armazenamento)/ETAPAS';
import ETAPAS02 from './PROCESSO(fibra)/ETAPAS02';
import ETAPAS03 from './PROCESSO(tamanho)/ETAPA03';
import ConfirmationModal from './Confirmação/Confirmar';
import ProgressScreen from './PROGRESSO/ProgressScreen';
import MainLayout from './Relatorio(HOME)/MainLayout';
function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  // This function will be called when the login is successful (e.g., when the user presses Enter)
  

  return (
    <MainLayout>
    </MainLayout>
  );
}

export default App;
