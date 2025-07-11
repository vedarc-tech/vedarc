import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HelmetProvider } from 'react-helmet-async';

// Import fonts directly (matches our index.css)
import '@fontsource/inter/400.css' // Regular
import '@fontsource/inter/700.css' // Bold
import '@fontsource/rajdhani/500.css' // Medium
import '@fontsource/rajdhani/700.css' // Bold
import '@fontsource/orbitron/700.css' // Bold only for headings

// Core styles
import './index.css'

// Create root with strict mode
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)