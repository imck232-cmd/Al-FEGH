import React from 'react';
import { X, Trash2, Copy, ExternalLink, History, Search } from 'lucide-react';
import type { ArchiveItem } from '../types';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: ArchiveItem[];
  onSelectItem: (item: ArchiveItem) => void;
  onDeleteItem: (id: string) => void;
  onClearArchive: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  archive,
  onSelectItem,
  onDeleteItem,
  onClearArchive
}) => {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-white">أرشيف الأبحاث</h2>
          </div>
          <div className="flex items-center gap-4">
            {archive.length > 0 && (
              <button
                onClick={onClearArchive}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                مسح الكل
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {archive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-xl text-gray-500 font-medium">الأرشيف فارغ حالياً</p>
              <p className="text-gray-600 mt-2">سيتم حفظ أبحاثك هنا تلقائياً</p>
            </div>
          ) : (
            archive.map((item) => (
              <div
                key={item.id}
                className="group bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-teal-500/50 hover:bg-gray-800/60 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-teal-500/70 bg-teal-500/10 px-2 py-0.5 rounded">
                        {item.timestamp}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-relaxed mb-3">
                      {item.question}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/20 text-teal-400 hover:bg-teal-600 hover:text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        عرض البحث بالكامل
                      </button>
                      <button
                        onClick={() => handleCopy(item.response.text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        نسخ النتيجة
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="self-end md:self-start p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="حذف من الأرشيف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950/50 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            يتم حفظ هذه البيانات محلياً على جهازك فقط
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
