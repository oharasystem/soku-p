import React, { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="p-10 font-sans">
      <h1 className="text-3xl font-bold mb-4">Soku-p</h1>
      <p className="mb-4 text-gray-700">Client-side image conversion with WASM.</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={() => setCount(count + 1)}
      >
        Count is {count}
      </button>
    </div>
  )
}
