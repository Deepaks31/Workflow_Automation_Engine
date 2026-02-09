import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Polyfill for libraries that expect Node's global in the browser (e.g. sockjs-client)
if (typeof global === 'undefined') {
  // eslint-disable-next-line no-undef
  window.global = window
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
) 