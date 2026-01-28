import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function ConverterSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 animate-pulse">
      {/* Trust Badge Placeholder */}
      <div className="flex justify-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-full" />
      </div>

      <Card className="shadow-lg border-gray-200">
        <CardHeader className="pb-2 flex flex-col items-center">
          {/* Title Placeholder */}
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Privacy Assurance Placeholder */}
          <div className="h-20 bg-gray-100 rounded-lg w-full border border-gray-200" />

          {/* File Selection Placeholder */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center space-y-4 bg-gray-50">
             <div className="h-16 w-16 bg-gray-200 rounded-full" />
             <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
             </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {/* Button Placeholder */}
          <div className="h-14 w-full bg-gray-200 rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
}
