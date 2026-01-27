import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Privacy from './pages/Privacy';

interface AppProps {
  initialSource?: string;
  initialTarget?: string;
}

export default function App({ initialSource, initialTarget }: AppProps) {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home initialSource={initialSource} initialTarget={initialTarget} />} />
        <Route path="/convert/:slug" element={<Home initialSource={initialSource} initialTarget={initialTarget} />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
