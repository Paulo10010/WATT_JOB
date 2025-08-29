
import Login from './LOGIN/Login';
import React, { useState } from 'react';
import OperationModal from './MENU/OperationModal';
function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  // This function will be called when the login is successful (e.g., when the user presses Enter)
  const handleLoginSuccess = () => {
    setCurrentScreen('operation');
  };

  return (
    <OperationModal />
  );
}

export default App;
