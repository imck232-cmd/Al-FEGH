import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResponseDisplay from './components/ResponseDisplay';
import Footer from './components/Footer';
import { getFiqhAnswer } from './services/geminiService';
import type { FiqhResponse } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fiqhResponse, setFiqhResponse] = useState<FiqhResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (question: string) => {
    if (!question.trim()) {
      setError("الرجاء إدخال سؤال فقهي.");
      return;
    }
    setIsLoading(true);
    // Initialize with an empty state to begin streaming into
    setFiqhResponse({ text: '', sources: [] });
    setError(null);

    try {
      for await (const result of getFiqhAnswer(question)) {
        if (result.textChunk) {
          setFiqhResponse(prev => {
            // Ensure prev is not null, which it shouldn't be due to initialization
            const currentText = prev ? prev.text : '';
            const currentSources = prev ? prev.sources : [];
            return {
              text: currentText + result.textChunk,
              sources: currentSources
            };
          });
        }
        if (result.sources) {
          setFiqhResponse(prev => {
            // Ensure prev is not null
            const currentText = prev ? prev.text : '';
            return {
              text: currentText,
              sources: result.sources || [],
            };
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب الإجابة. الرجاء المحاولة مرة أخرى.");
      setFiqhResponse(null); // Clear response on error
    } finally {
      setIsLoading(false);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <ResponseDisplay
          isLoading={isLoading}
          response={fiqhResponse}
          error={error}
          responseRef={responseRef}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;