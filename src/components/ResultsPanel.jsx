import React from 'react';
import { ResultIcon } from '../icons/Icons';

const ResultsPanel = ({ result }) => {
  if (!result) return null;

  return (
    <div className="result-panel">
      <h2>
        <ResultIcon />
        Результат анализа
      </h2>
      <div className="result-grid">
        <div className="result-item">
          <div className="result-label">Координаты точки</div>
          <div className="coordinates">
            {result.best_pt && result.best_pt.length >= 2 && 
             !isNaN(result.best_pt[0]) && !isNaN(result.best_pt[1])
              ? `${parseFloat(result.best_pt[0]).toFixed(5)}, ${parseFloat(result.best_pt[1]).toFixed(5)}` 
              : 'Не определены'}
          </div>
        </div>
        <div className="result-item">
          <div className="result-label">Покрыто домов</div>
          <div className="result-value">{result ? result.covered || 0 : 0}</div>
          <div className="result-label">из {result ? result.total || 0 : 0}</div>
        </div>
        <div className="result-item">
          <div className="result-label">Эффективность</div>
          <div className="result-value">
            {result && result.total > 0 
              ? Math.round(((result.covered || 0) / result.total) * 100) 
              : 0}%
          </div>
          <div className="result-label">покрытие</div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;