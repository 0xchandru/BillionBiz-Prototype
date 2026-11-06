import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../../src/index.css';
import { StorefrontRuntime } from './StorefrontRuntime';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StorefrontRuntime />
    </BrowserRouter>
  </React.StrictMode>,
);
