import { useState, useEffect, lazy, Suspense } from 'react';

// Client-side only Converter
const Converter = lazy(() => import('../components/Converter'));

interface HomeProps {
  initialSource?: string;
  initialTarget?: string;
}

export default function Home({ initialSource, initialTarget }: HomeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      {isClient ? (
        <Suspense fallback={
          <div className="w-full max-w-lg mx-auto p-4">
            <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
          </div>
        }>
          <Converter initialSource={initialSource} initialTarget={initialTarget} />
        </Suspense>
      ) : (
        <div className="w-full max-w-lg mx-auto p-4">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
