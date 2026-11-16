import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/geist'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import App from './App'
import { isConfigured } from './lib/supabase'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { NetworkProvider } from './context/NetworkContext'
import { AuthProvider } from './context/AuthContext'

function MissingConfig() {
  return (
    <div className="center-screen">
      <div className="empty">
        <h2>Kakehi isn’t configured</h2>
        <p className="muted">Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example), then rebuild.</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {isConfigured ? (
        <BrowserRouter>
          <ToastProvider>
            <NetworkProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </NetworkProvider>
          </ToastProvider>
        </BrowserRouter>
      ) : (
        <MissingConfig />
      )}
    </ThemeProvider>
  </StrictMode>,
)
