import React, { useState } from 'react';
import { EbookForm } from './components/EbookForm';
import { EbookGenerator } from './components/EbookGenerator';
import { EbookViewer } from './components/EbookViewer';
import { EbookData, EbookMetadata } from './types';
import { BookOpen } from 'lucide-react';

type AppStep = 'form' | 'generating' | 'viewer';

export default function App() {
  const [step, setStep] = useState<AppStep>('form');
  const [metadata, setMetadata] = useState<EbookMetadata | null>(null);
  const [ebookData, setEbookData] = useState<EbookData | null>(null);

  const handleFormSubmit = (meta: EbookMetadata) => {
    setMetadata(meta);
    setStep('generating');
  };

  const handleGenerationComplete = (data: EbookData) => {
    setEbookData(data);
    setStep('viewer');
  };

  const handleReset = () => {
    setMetadata(null);
    setEbookData(null);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Ebook Architect AI</h1>
          </div>
          {step === 'viewer' && ebookData && (
            <div className="text-sm text-gray-500 hidden sm:block">
              Viewing: <span className="font-medium text-gray-900">{ebookData.title}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <EbookForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {step === 'generating' && metadata && (
          <div className="animate-in fade-in zoom-in-95 duration-500 mt-12">
            <EbookGenerator metadata={metadata} onComplete={handleGenerationComplete} />
          </div>
        )}

        {step === 'viewer' && ebookData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
            <EbookViewer data={ebookData} onReset={handleReset} />
          </div>
        )}
      </main>
      
      {/* Background Graphic (applies to form/generator) */}
      {step !== 'viewer' && (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px] mix-blend-multiply" />
        </div>
      )}
    </div>
  );
}
