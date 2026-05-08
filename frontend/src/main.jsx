import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { loadAndApplyTheme } from './theme'
import './shared.css'

// Apply saved theme synchronously before first render to prevent flash
loadAndApplyTheme()

// Restore saved favicon from branding before first render
try {
  const branding = JSON.parse(localStorage.getItem('frbams_branding') || '{}')
  if (branding.faviconUrl) {
    const link = document.getElementById('frbams-favicon') || document.querySelector("link[rel~='icon']")
    if (link) link.href = branding.faviconUrl
  }
} catch {}

const root = document.getElementById('root')
root.style.cssText = 'margin:0;padding:0;height:100%;'
document.body.style.cssText = 'margin:0;padding:0;height:100%;'
document.documentElement.style.height = '100%'

ReactDOM.createRoot(root).render(<App />)
