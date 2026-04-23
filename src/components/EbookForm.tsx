import React, { useState } from 'react';
import { EbookMetadata } from '../types';
import { Book, PenTool, Layers, User } from 'lucide-react';
import { cn } from '../lib/utils'; // if using standard cn

interface Props {
  onSubmit: (meta: EbookMetadata) => void;
}

export function EbookForm({ onSubmit }: Props) {
  const [niche, setNiche] = useState('');
  const [pages, setPages] = useState<number>(30);
  const [tone, setTone] = useState('Professional & Authoritative');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ niche, pages, tone, author: author || 'Expert Author' });
  };

  const tones = [
    'Professional & Authoritative',
    'Casual & Conversational',
    'Academic & Educational',
    'Inspirational & Motivational',
    'Humorous & Witty'
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Let's build your eBook.</h2>
        <p className="mt-2 text-sm text-gray-500">Provide the details below, and our AI will architect and write a complete book for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Book className="w-4 h-4 inline-block mr-2 text-gray-400" />
            Topic / Niche
          </label>
          <input
            type="text"
            required
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. A Beginner's Guide to Urban Gardening"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline-block mr-2 text-gray-400" />
              Target Page Count
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="100"
                required
                value={pages}
                onChange={(e) => setPages(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
              />
              <span className="absolute right-4 top-3 text-sm text-gray-400 pointer-events-none">pages</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PenTool className="w-4 h-4 inline-block mr-2 text-gray-400" />
              Tone / Style
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans appearance-none"
            >
              {tones.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline-block mr-2 text-gray-400" />
            Author Name
          </label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. John Doe, Ph.D."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
          >
            <span>Generate eBook</span>
            <PenTool className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
