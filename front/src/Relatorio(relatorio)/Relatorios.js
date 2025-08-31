// src/pages/Relatorios.js
import React, { useState } from 'react';
import styles from './Relatorios.module.css';

// 1. DADOS DE EXEMPLO ATUALIZADOS para refletir o histórico de bobinas.
const historicoBobinas = [
  { id: 1, data: '30/08/2025', responsavel: 'Ana Silva', armazem: 'A', diametro: '1.25 mm', tamanho: '20 cm' },
  { id: 2, data: '30/08/2025', responsavel: 'Carlos Souza', armazem: 'B', diametro: '0.9 mm', tamanho: '40 cm' },
  { id: 3, data: '29/08/2025', responsavel: 'Ana Silva', armazem: 'A', diametro: '1.25 mm', tamanho: '40 cm' },
  { id: 4, data: '28/08/2025', responsavel: 'Bruna Costa', armazem: 'B', diametro: '0.9 mm', tamanho: '20 cm' },
  { id: 5, data: '27/08/2025', responsavel: 'Carlos Souza', armazem: 'A', diametro: '1.25 mm', tamanho: '20 cm' },
];

function Relatorios() {
  const [historico, setHistorico] = useState(historicoBobinas);
  
  // 2. ESTADOS PARA OS FILTROS
  const [filtroData, setFiltroData] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');

  // 3. LÓGICA DE FILTRAGEM
  //    Filtra os dados com base no que foi digitado, sem alterar a lista original.
  const historicoFiltrado = historico.filter(item => {
    // Lógica para o filtro de responsável (case-insensitive)
    const responsavelMatch = item.responsavel.toLowerCase().includes(filtroResponsavel.toLowerCase());
    
    // Lógica para o filtro de data (ainda não implementada, mas o campo está aqui)
    // const dataMatch = !filtroData || item.data === filtroData; // Exemplo de como seria

    return responsavelMatch; // && dataMatch;
  });

  return (
    <div className={styles.reportsContainer}>
      {/* 4. TÍTULO ATUALIZADO */}
      <h2 className={styles.title}>Histórico de Bobinas Criadas</h2>

      {/* 5. FILTROS ATUALIZADOS */}
      <div className={styles.filters}>
        <input
          type="date"
          className={styles.filterInput}
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por responsável..."
          className={styles.filterInput}
          value={filtroResponsavel}
          onChange={(e) => setFiltroResponsavel(e.target.value)}
        />
        <button className={styles.filterButton}>Filtrar</button>
        <button className={styles.exportButton}>Exportar</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          {/* 6. CABEÇALHO DA TABELA ATUALIZADO */}
          <thead>
            <tr>
              <th>Data</th>
              <th>Responsável</th>
              <th>Armazém Dest.</th>
              <th>Diâmetro do Fio</th>
              <th>Tamanho da Fibra</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* 7. MAPEAMENTO DOS NOVOS DADOS */}
            {historicoFiltrado.map((bobina) => (
              <tr key={bobina.id}>
                <td>{bobina.data}</td>
                <td>{bobina.responsavel}</td>
                <td>{bobina.armazem}</td>
                <td>{bobina.diametro}</td>
                <td>{bobina.tamanho}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Relatorios;