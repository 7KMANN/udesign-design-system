import React from 'react';
import ReactDOM from 'react-dom/client';
import { OperationsQueue } from '../../examples/operations-queue';
import { PresentationOrder } from '../../examples/presentation-order';
import './index.css';

const Screen = document.documentElement.dataset.design === 'operations' ? OperationsQueue : PresentationOrder;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Screen />
  </React.StrictMode>,
);
