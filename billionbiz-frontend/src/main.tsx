import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { checkAndHandleVersionUpgrade } from './config/version'

// Evaluate platform version check on bootstrap
checkAndHandleVersionUpgrade();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
