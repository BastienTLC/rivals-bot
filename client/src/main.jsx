import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import 'primereact/resources/themes/saga-green/theme.css'; // Thème vert
import 'primereact/resources/primereact.min.css'; // Styles de base de PrimeReact
import 'primeicons/primeicons.css'; // Icônes
import 'primeflex/primeflex.css'; // Flexbox utils
import './App.css'; // Fichier personnalisé pour police


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
