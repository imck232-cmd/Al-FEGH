
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResponseDisplay from './components/ResponseDisplay';
import Footer from './components/Footer';
import { getFiqhAnswer } from './services/geminiService';
import type { FiqhResponse, GroundingSource } from './types';

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
    setFiqhResponse({ text: '', sources: [] });
    setError(null);

    try {
      let currentText = '';
      const sourcesMap = new Map<string, GroundingSource>();

      for await (const result of getFiqhAnswer(question)) {
        if (result.textChunk) {
          currentText += result.textChunk;
          setFiqhResponse(prev => ({
            text: currentText,
            sources: prev ? prev.sources : []
          }));
        }
        
        if (result.sources) {
          result.sources.forEach(source => {
            if (source.uri) sourcesMap.set(source.uri, source);
          });
          
          setFiqhResponse(prev => ({
            text: currentText,
            sources: Array.from(sourcesMap.values())
          }));
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage = "حدث خطأ أثناء جلب الإجابة. الرجاء المحاولة مرة أخرى.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
