import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { convertImage, type OutputFormat } from '@/lib/converter';
import { cn } from '@/lib/utils';
import { SUPPORTED_INPUTS, SUPPORTED_OUTPUTS, MIME_TYPES } from '@/lib/constants';

interface ConverterProps {
  initialSource?: string;
  initialTarget?: string;
}

export default function Converter({ initialSource, initialTarget }: ConverterProps) {
  // Normalize initial props to lower case if present
  const defaultSource = initialSource ? initialSource.toLowerCase() : 'heic';
  const defaultTarget = initialTarget ? initialTarget.toLowerCase() : 'jpg';

  // Ensure defaults are valid, otherwise fallback
  const validSource = SUPPORTED_INPUTS.includes(defaultSource) ? defaultSource : 'heic';
  // Cast defaultTarget to OutputFormat if valid, else 'png'
  const validTarget = (SUPPORTED_OUTPUTS.includes(defaultTarget) ? defaultTarget : 'png') as OutputFormat;

  const [sourceFormat, setSourceFormat] = useState<string>(validSource);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>(validTarget);

  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Derive accept attribute from sourceFormat
  const acceptAttribute = MIME_TYPES[sourceFormat] || 'image/*';

  // Drag and Drop Handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Smart Drop Logic: Detect format from extension
      const nameParts = droppedFile.name.split('.');
      const ext = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : '';

      let detectedFormat = '';
      if (ext && SUPPORTED_INPUTS.includes(ext)) {
        detectedFormat = ext;
      } else if (ext === 'jpeg' && SUPPORTED_INPUTS.includes('jpg')) {
         detectedFormat = 'jpg'; // normalize jpeg to jpg if preferred, or keep as is
      }

      // Check against supported inputs
      if (detectedFormat && SUPPORTED_INPUTS.includes(detectedFormat)) {
        setSourceFormat(detectedFormat);
        setFile(droppedFile);
        setError(null);
        setConvertedUrl(null);
      } else {
        // Fallback: Check if it's generally an image or matches current selection
        // If strict validation is required per step instructions:
        // "update the 'From' state to match the dropped file"

        // If we couldn't detect a supported format, check if generic image
        if (!droppedFile.type.startsWith('image/') && !droppedFile.name.toLowerCase().endsWith('.heic')) {
          setError('Please upload a valid image file.');
          return;
        }

        // If it is a valid image but we didn't match extension exactly (e.g. rare case),
        // strictly speaking we should probably set error if it's not in SUPPORTED_INPUTS.
        // But let's try to be helpful.
        if (droppedFile.type === 'image/jpeg') setSourceFormat('jpg');
        else if (droppedFile.type === 'image/png') setSourceFormat('png');
        else if (droppedFile.type === 'image/webp') setSourceFormat('webp');
        // If still unknown but looks like image, just set file and warn or leave source as is?
        // Current requirement: "automatically update the 'From' state"
        // If not supported input, we should probably error.

        if (!detectedFormat) {
             // Try to map mime type back to extension
             const mimeEntry = Object.entries(MIME_TYPES).find(([_, mime]) => mime === droppedFile.type);
             if (mimeEntry && SUPPORTED_INPUTS.includes(mimeEntry[0])) {
                 setSourceFormat(mimeEntry[0]);
                 setFile(droppedFile);
                 setError(null);
                 setConvertedUrl(null);
             } else if (droppedFile.name.toLowerCase().endsWith('.heic')) {
                 setSourceFormat('heic');
                 setFile(droppedFile);
                 setError(null);
                 setConvertedUrl(null);
             } else {
                 setError('File format not supported for conversion.');
             }
        }
      }
    }
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setConvertedUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);

    try {
      // Small timeout to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const url = await convertImage(file, targetFormat);
      setConvertedUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    const link = document.createElement('a');
    link.href = convertedUrl;
    const originalName = file?.name || 'image';
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    link.download = `${nameWithoutExt}.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setConvertedUrl(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Image Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="source-format" className="text-sm font-medium text-gray-700">Convert from:</label>
              <Select
                id="source-format"
                value={sourceFormat}
                onChange={(e) => {
                    setSourceFormat(e.target.value);
                    // Reset file if it doesn't match new format?
                    // Usually better to let user keep file but maybe warn.
                    // For now, let's reset to avoid confusion if types mismatch strictly
                    if (file) setFile(null);
                }}
                disabled={isConverting}
              >
                {SUPPORTED_INPUTS.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="target-format" className="text-sm font-medium text-gray-700">Convert to:</label>
              <Select
                id="target-format"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as OutputFormat)}
                disabled={isConverting}
              >
                {SUPPORTED_OUTPUTS.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Drop Zone */}
          {!file ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept={acceptAttribute}
                onChange={onFileSelect}
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm font-medium">Drag & drop {sourceFormat.toUpperCase()} here</p>
                <p className="text-xs text-gray-400">or click to select</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                 <div className="bg-blue-100 p-2 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                 </div>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-red-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {error}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!convertedUrl ? (
            <Button
              className="w-full"
              onClick={handleConvert}
              disabled={!file || isConverting}
            >
              {isConverting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Converting...
                </>
              ) : (
                "Convert"
              )}
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleDownload}
              >
                Download Result
              </Button>
               <Button
                variant="outline"
                className="w-full"
                onClick={reset}
              >
                Convert Another
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
