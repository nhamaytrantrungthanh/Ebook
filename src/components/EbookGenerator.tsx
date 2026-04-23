import React, { useEffect, useRef, useState } from 'react';
import { EbookData, EbookMetadata } from '../types';
import { generateOutline, generateSection } from '../services/ai';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  metadata: EbookMetadata;
  onComplete: (data: EbookData) => void;
}

interface LogItem {
  id: string;
  status: 'pending' | 'active' | 'success' | 'error';
  message: string;
}

export function EbookGenerator({ metadata, onComplete }: Props) {
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 'start', status: 'active', message: 'Initializing eBook Architect AI...' }
  ]);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  const addLog = (log: Omit<LogItem, 'id'>) => {
    setLogs(prev => {
      const newLogs = [...prev];
      // Mark previous active as success
      const activeIdx = newLogs.findIndex(l => l.status === 'active');
      if (activeIdx >= 0) {
         newLogs[activeIdx] = { ...newLogs[activeIdx], status: 'success' };
      }
      newLogs.push({ ...log, id: Math.random().toString(36).substring(7) });
      return newLogs;
    });
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function buildBook() {
      try {
        addLog({ status: 'active', message: 'Drafting structure and outline...' });
        setProgress(10);
        
        const outline = await generateOutline(metadata.niche, metadata.tone, metadata.pages, metadata.author);
        
        const generatedChapters: { title: string; content: string }[] = [];
        
        // Prepare list of things to generate
        const sectionsToGenerate = [
          { title: 'Introduction', description: outline.introduction, isSpecial: true },
          ...outline.chapters.map(c => ({ title: c.title, description: c.description, isSpecial: false })),
          { title: 'Conclusion', description: outline.conclusion, isSpecial: true }
        ];

        const totalSections = sectionsToGenerate.length;

        for (let i = 0; i < totalSections; i++) {
          const section = sectionsToGenerate[i];
          addLog({ status: 'active', message: `Writing section ${i + 1} of ${totalSections}: ${section.title}...` });
          
          const content = await generateSection(
            outline.title,
            metadata.author,
            metadata.tone,
            section.title,
            section.description,
            section.isSpecial
          );

          generatedChapters.push({
            title: section.title,
            content
          });

          setProgress(10 + Math.floor(((i + 1) / totalSections) * 90));
        }

        addLog({ status: 'success', message: 'eBook successfully generated!' });
        
        setTimeout(() => {
          onComplete({
            metadata,
            title: outline.title,
            chapters: generatedChapters
          });
        }, 1500);

      } catch (err: any) {
        addLog({ status: 'error', message: `Generation failed: ${err.message}` });
      }
    }

    buildBook();
  }, [metadata, onComplete]);

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-white border border-gray-100 rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Architecting Details</h2>
        <p className="text-gray-500 text-sm mt-2">Our AI is researching and writing your book piece by piece.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3">
            {log.status === 'active' && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />}
            {log.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {log.status === 'error' && <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0"><div className="w-2 h-2 bg-red-500 rounded-full"/></div>}
            
            <p className={cn(
              "text-sm font-medium",
              log.status === 'active' ? "text-indigo-900" : 
              log.status === 'success' ? "text-gray-500" : "text-red-600"
            )}>
              {log.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
