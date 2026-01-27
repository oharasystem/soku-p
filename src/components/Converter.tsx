import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { convertImage, type OutputFormat } from '@/lib/converter';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface ConverterProps {
  initialSource?: string;
  initialTarget?: string;
}

export default function Converter({ initialSource, initialTarget }: ConverterProps) {
  // Default to WebP if not specified or invalid
  const defaultTarget = initialTarget && ['webp', 'png', 'jpeg', 'jpg'].includes(initialTarget.toLowerCase())
    ? (initialTarget.toLowerCase() === 'jpg' ? 'jpeg' : initialTarget.toLowerCase())
    : 'webp';

  const [targetFormat, setTargetFormat] = useState<OutputFormat>(defaultTarget as OutputFormat);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clean up preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile) return;

    // Create preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setFile(selectedFile);
    setConvertedUrl(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);
    try {
      // Small timeout to allow UI render
      await new Promise(resolve => setTimeout(resolve, 100));
      const url = await convertImage(file, targetFormat);
      setConvertedUrl(url);
    } catch (err: any) {
      console.error(err);
      setError('変換中にエラーが発生しました。別の形式や画像を試してください。');
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setConvertedUrl(null);
    setError(null);
  };

  const outputOptions = [
    { label: 'WebP', value: 'webp' },
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      {/* Trust Badge */}
      <div className="flex justify-center mb-6">
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
          完全無料・登録不要
        </span>
      </div>

      <Card className="shadow-lg border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-xl font-bold text-gray-900">画像変換</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Privacy Assurance */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start space-x-3">
             <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
             <p className="text-sm text-green-800 leading-relaxed">
               選択した画像はサーバーへ送信されません。すべての処理はお使いの端末内で完結するため、安心してご利用いただけます。
             </p>
          </div>

          {/* File Selection / Drop Zone */}
          {!file ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
                isDragging ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/heic, .heic"
                onChange={onFileSelect}
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                   </svg>
                </div>
                <div>
                    <p className="text-base font-bold text-gray-700">クリックして写真を選択</p>
                    <p className="text-sm text-gray-500 mt-1">またはドラッグ＆ドロップ</p>
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WebP, AVIF, HEIC 対応
                </p>
              </div>
            </div>
          ) : (
             <div className="space-y-6">
                {/* Thumbnail & File Info */}
                <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 flex flex-col items-center space-y-3">
                   {previewUrl && (
                     <div className="relative w-full h-48 bg-checkerboard rounded-md overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                     </div>
                   )}

                   <div className="text-center">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                   </div>

                   <button
                     onClick={reset}
                     className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 transition-colors"
                     title="削除"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                   </button>
                </div>

                {/* Convert Configuration */}
                <div className="space-y-2">
                  <label htmlFor="target-format" className="text-sm font-bold text-gray-700 block">
                    変換先 (Format):
                  </label>
                  <Select
                    id="target-format"
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as OutputFormat)}
                    disabled={isConverting || !!convertedUrl}
                    className="w-full"
                  >
                    {outputOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </div>
             </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-2">
          {!convertedUrl ? (
            <Button
              className={cn("w-full py-6 text-lg font-bold shadow-md transition-all", file ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300")}
              onClick={handleConvert}
              disabled={!file || isConverting}
            >
              {isConverting ? (
                <>
                  <Spinner className="mr-2 h-5 w-5 text-white" />
                  変換中...
                </>
              ) : (
                "変換してダウンロード"
              )}
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <Button
                variant="default"
                className="w-full py-6 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-md"
                onClick={() => {
                   const link = document.createElement('a');
                   link.href = convertedUrl;
                   const originalName = file?.name || 'image';
                   const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                   const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
                   link.download = `${nameWithoutExt}_converted.${ext}`;
                   document.body.appendChild(link);
                   link.click();
                   document.body.removeChild(link);
                }}
              >
                ダウンロード
              </Button>
               <Button
                variant="outline"
                className="w-full"
                onClick={reset}
              >
                他の画像を変換
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
