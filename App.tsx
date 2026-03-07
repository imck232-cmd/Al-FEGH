import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResponseDisplay from './components/ResponseDisplay';
import Footer from './components/Footer';
import ArchiveModal from './components/ArchiveModal';
import { getFiqhAnswer } from './services/geminiService';
import type { FiqhResponse, ArchiveItem } from './types';
import { ShieldAlert, Info, CheckCircle2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fiqhResponse, setFiqhResponse] = useState<FiqhResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'short' | 'detailed'>('detailed');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'completed'>('idle');
  const responseRef = useRef<HTMLDivElement>(null);

  // Load archive from localStorage on mount
  useEffect(() => {
    const savedArchive = localStorage.getItem('fiqh_archive');
    if (savedArchive) {
      try {
        setArchive(JSON.parse(savedArchive));
      } catch (e) {
        console.error("Failed to parse archive", e);
      }
    }
  }, []);

  // Save archive to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fiqh_archive', JSON.stringify(archive));
  }, [archive]);

  const handleSearch = useCallback(async (question: string) => {
    if (!question.trim()) {
      setError("الرجاء إدخال سؤال فقهي.");
      return;
    }
    setIsLoading(true);
    setSearchStatus('searching');
    // Initialize with an empty state to begin streaming into
    const initialResponse: FiqhResponse = { text: '', sources: [] };
    setFiqhResponse(initialResponse);
    setError(null);

    let finalResponseText = '';
    let finalSources = initialResponse.sources;

    try {
      for await (const result of getFiqhAnswer(question)) {
        if (result.textChunk) {
          finalResponseText += result.textChunk;
          setFiqhResponse(prev => ({
            text: (prev?.text || '') + result.textChunk,
            sources: prev?.sources || []
          }));
        }
        if (result.sources) {
          finalSources = result.sources;
          setFiqhResponse(prev => ({
            text: prev?.text || '',
            sources: result.sources || []
          }));
        }
      }

      setSearchStatus('completed');

      // Save to archive after successful completion
      const newItem: ArchiveItem = {
        id: Date.now().toString(),
        question,
        response: { text: finalResponseText, sources: finalSources },
        timestamp: new Date().toLocaleString('ar-EG', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      };
      setArchive(prev => [newItem, ...prev]);

    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب الإجابة. الرجاء المحاولة مرة أخرى.");
      setFiqhResponse(null); // Clear response on error
      setSearchStatus('idle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectArchiveItem = (item: ArchiveItem) => {
    setFiqhResponse(item.response);
    setIsArchiveOpen(false);
    setSearchStatus('completed');
    // Scroll to response area
    setTimeout(() => {
      responseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteArchiveItem = (id: string) => {
    setArchive(prev => prev.filter(item => item.id !== id));
  };

  const handleClearArchive = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع الأبحاث المؤرشفة؟")) {
      setArchive([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <Header onOpenArchive={() => setIsArchiveOpen(true)} />
      
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col max-w-5xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        {/* View Mode Toggles */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setViewMode('short')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all duration-300 border-2 text-sm ${
              viewMode === 'short' 
                ? 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/20' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            الجواب المختصر والجدول
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all duration-300 border-2 text-sm ${
              viewMode === 'detailed' 
                ? 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/20' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            الجواب الموسع والشامل
          </button>
        </div>

        {/* Disclaimer Section */}
        <div className="mb-8 bg-amber-900/20 border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl animate-in fade-in duration-500">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
            <div className="space-y-3 text-right">
              <h3 className="text-xl font-bold text-amber-400">تنبيه مهم إخلاء للمسؤولية</h3>
              <div className="text-amber-200/90 leading-relaxed space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-amber-500">أولاً:</span>
                  الإجابات قد تكون غير دقيقة في بعض الأوقات ولذا يرجى التأكد وعدم الاعتماد الكلي على البرنامج.
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-amber-500">ثانياً:</span>
                  البرنامج للعلم فقط ولا يصح الاعتماد عليه في الفتوى أو الأخذ به كفتوى بل تؤخذ الفتوى من العلماء لا من المواقع والبرامج.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Status Indicator */}
        {searchStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 ${
            searchStatus === 'searching' ? 'bg-teal-500/10 text-teal-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {searchStatus === 'searching' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold">يرجى الانتظار حتى إتمام البحث...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">تم البحث بنجاح</span>
              </>
            )}
          </div>
        )}

        <ResponseDisplay
          isLoading={isLoading}
          response={fiqhResponse}
          error={error}
          responseRef={responseRef}
          viewMode={viewMode}
        />
      </main>
      <Footer />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archive={archive}
        onSelectItem={handleSelectArchiveItem}
        onDeleteItem={handleDeleteArchiveItem}
        onClearArchive={handleClearArchive}
      />
    </div>
  );
};

export default App;
