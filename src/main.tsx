import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SAMPLE_DECISIONS } from './data/decisions';
import { assertDecisionTradeoffsInDev } from './engine/validators';
import './index.css';

// Loud, fail-fast checks on the game content data files — never on user input.
assertDecisionTradeoffsInDev(SAMPLE_DECISIONS, import.meta.env.DEV);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
