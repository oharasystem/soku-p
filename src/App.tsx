import React from 'react'
import Converter from './components/Converter'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Soku-p</h1>
        <p className="text-gray-600">Client-side image conversion powered by WebAssembly</p>
      </div>

      <Converter />

      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>Built with Vite, React, Hono & WASM</p>
      </footer>
    </div>
  )
}
