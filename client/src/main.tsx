import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter
import './index.css'
import './admin.css' // Re-import admin-specific CSS
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* Removed basename and SpaRedirectHandler */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
