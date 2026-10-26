import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Swiper's own stylesheet, beside the tokens, for the registry Gallery.
import 'swiper/css/bundle';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
