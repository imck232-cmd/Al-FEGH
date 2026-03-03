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
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ isLoading, response, error, responseRef }) => {
  // Show loader only when loading and no text has arrived yet.
  if (isLoading && (!response || !response.text)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg shadow-inner">
        <LoaderCircle className="w-16 h-16 text-teal-400 animate-spin mb-4" />
        <p className="text-xl text-gray-300">جاري البحث وتحليل المعلومات...</p>
        <p className="text-gray-400">قد يستغرق هذا بعض الوقت، شكرًا لصبركم.</p>
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
        <div ref={responseRef} className="prose prose-invert max-w-none markdown-body prose-h3:text-teal-400 prose-h3:border-b prose-h3:border-gray-600 prose-h3:pb-2 prose-table:border prose-table:border-gray-600 prose-th:bg-gray-700 prose-th:p-3 prose-td:p-3 prose-blockquote:border-r-4 prose-blockquote:border-teal-500 prose-blockquote:pr-4 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{response.text}</ReactMarkdown>
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