import React from 'react'
import { hydrateRoot } from 'react-dom/client'
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
  hydrateRoot(root, <App initialSource={initialData.source} initialTarget={initialData.target} />)
}
