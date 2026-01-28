import { useState, useEffect, lazy, Suspense } from 'react';
import { ShieldCheck, Zap, FileImage, Check } from 'lucide-react';
import { SUPPORTED_INPUTS, SUPPORTED_OUTPUTS } from '@/lib/constants';
import ConverterSkeleton from '@/components/ConverterSkeleton';

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
    <div className="w-full flex flex-col items-center space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Soku-p
        </h1>
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
          ブラウザ完結！高速・安全な画像フォーマット変換ツール<br />
          <span className="text-sm md:text-base opacity-80">
            WebAssemblyによる高速処理で、あなたのプライバシーを守ります。
          </span>
        </p>
      </div>

      {/* Converter Section */}
      <div className="w-full">
        {isClient ? (
          <Suspense fallback={<ConverterSkeleton />}>
            <Converter initialSource={initialSource} initialTarget={initialTarget} />
          </Suspense>
        ) : (
          <ConverterSkeleton />
        )}
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-green-50 rounded-full">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">完全クライアントサイド処理</h3>
          <p className="text-gray-600 leading-relaxed">
            画像はお使いの端末内で処理されます。サーバーへのアップロードは一切行われないため、プライバシーは完全に守られます。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
           <div className="p-3 bg-blue-50 rounded-full">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">WebAssemblyによる高速変換</h3>
          <p className="text-gray-600 leading-relaxed">
            最新技術WebAssemblyを採用し、ネイティブアプリ並みの高速な画像処理を実現しました。待ち時間なく快適に利用できます。
          </p>
        </div>
      </div>

      {/* Supported Formats Section */}
      <div className="w-full max-w-4xl px-4 text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">対応フォーマット</h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center justify-center gap-2">
                  <FileImage className="w-5 h-5" /> 入力 (Input)
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUPPORTED_INPUTS.map(ext => (
                    <span key={ext} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium uppercase border border-gray-200">
                      {ext}
                    </span>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" /> 出力 (Output)
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUPPORTED_OUTPUTS.map(ext => (
                    <span key={ext} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium uppercase border border-blue-100">
                      {ext}
                    </span>
                  ))}
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
