import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoaderCircle, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import type { FiqhResponse } from '../types';
import ExportButtons from './ExportButtons';

interface ResponseDisplayProps {
  isLoading: boolean;
  response: FiqhResponse | null;
  error: string | null;
  responseRef: React.RefObject<HTMLDivElement>;
  viewMode: 'short' | 'detailed';
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ isLoading, response, error, responseRef, viewMode }) => {
  // Helper to extract content based on markers
  const getDisplayContent = (text: string) => {
    if (viewMode === 'detailed') {
      // Return everything but strip the markers themselves
      return text
        .replace(/\[START_SHORT_ANSWER\]/g, '')
        .replace(/\[END_SHORT_ANSWER\]/g, '')
        .replace(/\[START_DETAILED_ANSWER\]/g, '')
        .replace(/\[END_DETAILED_ANSWER\]/g, '');
    } else {
      // Extract only the short answer part
      const match = text.match(/\[START_SHORT_ANSWER\]([\s\S]*?)\[END_SHORT_ANSWER\]/);
      if (match) return match[1];
      
      // Fallback: if markers aren't complete yet (during streaming), show what we have
      return text.replace(/\[START_SHORT_ANSWER\]/g, '').replace(/\[END_SHORT_ANSWER\]/g, '');
    }
  };

  // Show loader only when loading and no text has arrived yet.
  if (isLoading && (!response || !response.text)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-gray-800/50 rounded-2xl shadow-inner border border-gray-700/50">
        <LoaderCircle className="w-16 h-16 text-teal-400 animate-spin mb-6" />
        <p className="text-2xl font-bold text-gray-200 mb-2">جاري البحث وتحليل المعلومات...</p>
        <p className="text-teal-400/80 animate-pulse">يرجى الانتظار حتى إتمام البحث.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-red-900/20 border border-red-500 rounded-lg shadow-inner">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-xl text-red-300">حدث خطأ</p>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  // Show welcome message only if there's no response object at all.
  if (!response) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg shadow-inner">
        <MessageSquareQuote className="w-16 h-16 text-gray-500 mb-4" />
        <p className="text-xl text-gray-400">
          أهلاً بك في رفيقك الفقهي. ابدأ بطرح سؤالك في الأعلى.
        </p>
      </div>
    );
  }

  // Render the response area as soon as there's a response object,
  // even if the text is still streaming in.
  return (
    <div className="flex-grow bg-gray-800/50 rounded-lg shadow-inner flex flex-col overflow-hidden">
      {/* Header for the response area with export buttons */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/80 sticky top-0 z-20">
        <h2 className="text-lg font-bold text-teal-400">الإجابة الفقهية</h2>
        <ExportButtons content={response.text} responseRef={responseRef} />
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8">
        <div ref={responseRef} className="prose prose-invert max-w-none markdown-body 
          prose-h1:text-3xl prose-h1:font-black prose-h1:text-teal-300 prose-h1:border-b-2 prose-h1:border-teal-500/30 prose-h1:pb-4 prose-h1:mb-8
          prose-h2:text-2xl prose-h2:font-bold prose-h2:text-teal-400 prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-3 prose-h2:mt-10 prose-h2:mb-6
          prose-h3:text-xl prose-h3:font-bold prose-h3:text-cyan-400 prose-h3:mt-8 prose-h3:mb-4
          prose-table:border prose-table:border-gray-700 prose-table:rounded-xl prose-table:overflow-hidden prose-table:text-sm md:prose-table:text-base
          prose-th:bg-gray-800 prose-th:text-teal-300 prose-th:p-3 md:prose-th:p-4 prose-th:text-center prose-th:font-bold
          prose-td:p-3 md:prose-td:p-4 prose-td:border-t prose-td:border-gray-700/50 prose-td:text-center prose-td:leading-relaxed
          prose-blockquote:border-r-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/10 prose-blockquote:py-3 prose-blockquote:pr-6 prose-blockquote:italic prose-blockquote:text-emerald-300 prose-blockquote:rounded-l-lg prose-blockquote:my-6
          prose-strong:text-orange-400 prose-strong:font-bold
          prose-a:text-cyan-400 hover:prose-a:text-cyan-300 transition-colors">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {getDisplayContent(response.text)}
          </ReactMarkdown>
        </div>
        
        {response.sources && response.sources.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-600">
            <h3 className="text-xl font-bold text-teal-400 mb-4">المصادر التي تم الرجوع إليها:</h3>
            <ul className="list-disc pr-5 space-y-3">
              {response.sources.map((source, index) => (
                <li key={index}>
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseDisplay;