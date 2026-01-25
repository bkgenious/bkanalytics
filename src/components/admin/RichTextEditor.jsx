'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function RichTextEditor({ value, onChange, label, placeholder }) {
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {label}
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setMode('edit')}
                        className={`
                            flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${mode === 'edit'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                            }
                        `}
                    >
                        <PencilSquareIcon className="w-3.5 h-3.5 mr-1.5" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`
                            flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                            ${mode === 'preview'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                            }
                        `}
                    >
                        <EyeIcon className="w-3.5 h-3.5 mr-1.5" />
                        Preview
                    </button>
                </div>
            </div>

            <div className={`relative rounded-xl overflow-hidden border transition-shadow focus-within:ring-2 focus-within:ring-primary-500/20 ${mode === 'edit' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent'}`}>
                {mode === 'edit' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-64 p-4 bg-transparent border-none focus:ring-0 resize-y text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed"
                    />
                ) : (
                    <div className="w-full h-64 p-4 overflow-y-auto prose prose-slate dark:prose-invert prose-sm max-w-none">
                        {value ? (
                            <ReactMarkdown>{value}</ReactMarkdown>
                        ) : (
                            <p className="text-slate-400 italic">Nothing to preview...</p>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports **Markdown**: # Headers, - Lists, **Bold**, [Links](url)
            </p>
        </div>
    );
}
