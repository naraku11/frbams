import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { loadAndApplyTheme } from './theme'
import './shared.css'

// Apply saved theme synchronously before first render to prevent flash
loadAndApplyTheme()

const root = document.getElementById('root')
root.style.cssText = 'margin:0;padding:0;height:100%;'
document.body.style.cssText = 'margin:0;padding:0;height:100%;'
document.documentElement.style.height = '100%'

ReactDOM.createRoot(root).render(<App />)
