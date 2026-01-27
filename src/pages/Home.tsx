import React from 'react';
import Converter from '../components/Converter';

interface HomeProps {
  initialSource?: string;
  initialTarget?: string;
}

export default function Home({ initialSource, initialTarget }: HomeProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Soku-p
        </h1>
        <p className="text-gray-600 text-lg">
          WebAssemblyによる高速・安全なクライアントサイド画像変換
        </p>
      </div>

      <Converter initialSource={initialSource} initialTarget={initialTarget} />
    </div>
  );
}
