import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../../src/index.css';
import { StorefrontRuntime } from './StorefrontRuntime';

// Browser requests stay on the storefront origin; the runtime proxies /api to
// the backend so visitors never try to call their own localhost.
if (typeof window !== 'undefined') {
  localStorage.removeItem('billionbiz_api_override');
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StorefrontRuntime />
    </BrowserRouter>
  </React.StrictMode>,
);
