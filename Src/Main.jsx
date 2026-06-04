import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MolkkyApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MolkkyApp />
  </StrictMode>,
)
