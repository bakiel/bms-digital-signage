import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom' // Import more hooks
import './index.css'
import './admin.css' // Re-import admin-specific CSS
import App from './App.tsx'

// Helper component to handle the redirect logic from 404.html
const SpaRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('p');

    if (redirectPath) {
      // Use replace to avoid adding the redirect URL to history
      navigate(redirectPath, { replace: true }); 
    }
    // Run only once on initial load
  }, [location, navigate]); 

  return null; // This component doesn't render anything
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Restore basename for GitHub Pages deployment */}
    <BrowserRouter basename="/bms-digital-signage/">
      <SpaRedirectHandler /> {/* Add the handler component */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
