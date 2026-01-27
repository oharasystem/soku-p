import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

declare global {
  interface Window {
    __INITIAL_DATA__?: {
      source?: string;
      target?: string;
    }
  }
}

const root = document.getElementById('root')
if (root) {
  const initialData = window.__INITIAL_DATA__ || {};
  hydrateRoot(root,
    <BrowserRouter>
      <App initialSource={initialData.source} initialTarget={initialData.target} />
    </BrowserRouter>
  )
}
