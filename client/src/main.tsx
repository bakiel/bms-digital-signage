import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter
import './index.css'
import './admin.css' // Re-import admin-specific CSS
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Add basename for GitHub Pages deployment */}
    <BrowserRouter basename="/bms-digital-signage"> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)
