import React, { useState, useEffect } from 'react';
import { EbookData } from '../types';
import Markdown from 'react-markdown';
import { Download, FileText, BookOpen, ChevronRight, Menu, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  data: EbookData;
  onReset: () => void;
}

export function EbookViewer({ data, onReset }: Props) {
  const [activeSegment, setActiveSegment] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Clean up print mode just in case
  useEffect(() => {
    return () => {
      document.body.classList.remove('print-mode');
    };
  }, []);

  const handlePrintPdf = async () => {
    setIsGeneratingPdf(true);
    // Crucial for html2canvas to not crop the top of the canvas
    window.scrollTo(0, 0);
    
    // Give react time to render the fixed pdf container and load styles
    setTimeout(async () => {
      try {
        let html2pdf = (window as any).html2pdf;
        if (!html2pdf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          html2pdf = (window as any).html2pdf;
        }

        const element = document.getElementById('pdf-content');
        if (!element) return;
        
        const opt = {
          margin:       [15, 15],
          filename:     `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true, 
            windowWidth: element.scrollWidth, 
            windowHeight: element.scrollHeight,
            scrollY: 0 
          },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: ['css', 'legacy'] }
        };
        
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error(err);
        alert("Error generating PDF. Please use 'Export to Word' instead.");
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 800); // Increased delay for layout to settle
  };

  const handleDownloadWord = () => {
    const rawContent = document.getElementById('pdf-content')?.innerHTML || "";
    // Wrap to simulate pages for MS Word with simple styling
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; }
          .prose { max-width: 100%; }
          h1 { font-size: 24pt; text-align: center; margin-top: 100pt; }
          h2 { font-size: 18pt; margin-top: 24pt; border-bottom: 1px solid #ccc; padding-bottom: 8pt; }
          h3 { font-size: 14pt; margin-top: 16pt; }
          p { margin-bottom: 12pt; }
          .html2pdf__page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        ${rawContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentChapter = data.chapters[activeSegment];

  return (
    <>
      <div className="flex h-[calc(100vh-6rem)] bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden mt-6 print:hidden">
        
        {/* Sidebar TOC */}
        <div 
          className={cn(
            "flex-shrink-0 bg-gray-50/50 border-r border-gray-200 transition-all duration-300 flex flex-col",
            sidebarOpen ? "w-80" : "w-0 overflow-hidden border-none"
          )}
        >
          <div className="p-6 border-b border-gray-200 bg-white">
            <h2 className="font-serif font-bold text-lg text-gray-900 leading-tight mb-2">
              {data.title}
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              By {data.metadata.author}
            </p>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 space-y-1">
            {data.chapters.map((chapter, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSegment(idx)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group",
                  activeSegment === idx 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
                )}
              >
                <span className="line-clamp-2 pr-2">{chapter.title}</span>
                {activeSegment === idx && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2">
            <button
              onClick={handlePrintPdf}
              disabled={isGeneratingPdf}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handleDownloadWord}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <FileText className="w-4 h-4" />
              <span>Export to Word</span>
            </button>
            <button
              onClick={onReset}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
            >
              Create New Book
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-medium text-gray-400">
                Chapter {activeSegment + 1} of {data.chapters.length}
              </span>
            </div>
            <div className="text-right">
               <span className="text-gray-900 font-medium text-sm block">{currentChapter?.title}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-16 scroll-smooth" id="print-area">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-indigo prose-lg max-w-none">
                 <Markdown>{currentChapter?.content || ""}</Markdown>
              </div>
              
              <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
                <button
                  disabled={activeSegment === 0}
                  onClick={() => setActiveSegment(s => Math.max(0, s - 1))}
                  className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous Chapter
                </button>
                
                <button
                  disabled={activeSegment === data.chapters.length - 1}
                  onClick={() => {
                    setActiveSegment(s => Math.min(data.chapters.length - 1, s + 1));
                    document.getElementById('print-area')?.scrollTo(0, 0);
                  }}
                  className="px-6 py-3 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-6" />
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Generating High-Quality PDF</h3>
          <p className="text-gray-500 font-medium">Please wait, compiling pages...</p>
        </div>
      )}

      {/* Container for PDF generation - perfectly standard document flow positioned at very top but hidden behind loading */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-full z-[99990] bg-white min-h-screen",
          isGeneratingPdf ? "block" : "hidden"
        )}
      >
        <div id="pdf-content" className="w-[800px] mx-auto bg-white text-black p-12 font-sans text-left">
           <div className="text-center mb-16 mt-32">
              <h1 className="text-5xl font-serif font-bold text-black mb-8 leading-tight">{data.title}</h1>
              <p className="text-xl text-black">By {data.metadata.author}</p>
              <div className="mt-32 text-sm text-gray-600">Generated by Ebook Architect AI</div>
            </div>
            {/* Using standard page break class for html2pdf */}
            <div className="html2pdf__page-break" />

            {/* Print TOC */}
            <div className="mb-16 mt-16">
              <h2 className="text-3xl font-bold font-serif text-black mb-8 border-b border-gray-300 pb-4">Table of Contents</h2>
              <ul className="space-y-4">
                {data.chapters.map((c, i) => (
                  <li key={i} className="text-lg font-medium text-black">{c.title}</li>
                ))}
              </ul>
            </div>
            <div className="html2pdf__page-break" />

            {/* Print All Chapters */}
            {data.chapters.map((chapter, i) => (
              <div key={i}>
                <h2 className="text-4xl font-bold font-serif text-black mb-8 leading-tight">
                  {chapter.title}
                </h2>
                <div className="prose prose-lg max-w-none prose-p:text-black prose-headings:text-black mt-8 mb-16">
                   <Markdown>{chapter.content}</Markdown>
                </div>
                {i < data.chapters.length - 1 && (
                  <div className="html2pdf__page-break" />
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
