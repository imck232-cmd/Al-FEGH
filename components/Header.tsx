
import React from 'react';
import { BookOpen, History } from 'lucide-react';

interface HeaderProps {
  onOpenArchive: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenArchive }) => {
  return (
    <header className="p-4 md:p-6 border-b border-gray-700 shadow-lg bg-gray-900/50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-teal-400 shrink-0" />
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-500">
              رفيقك في الأسئلة والاستفسارات الفقهية
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 hidden md:block font-medium">
              مساعدك الذكي الموثوق للإجابات الفقهية الموثقة
            </p>
          </div>
        </div>
        
        <button
          onClick={onOpenArchive}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 border border-gray-700 rounded-lg text-teal-400 hover:bg-teal-600 hover:text-white hover:border-teal-500 transition-all duration-300 shadow-md group shrink-0 text-sm"
          title="عرض الأرشيف"
        >
          <History className="w-4 h-4 group-hover:rotate-[-12deg] transition-transform" />
          <span className="font-bold">الأرشيف</span>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center md:hidden font-medium">
        مساعدك الذكي الموثوق للإجابات الفقهية الموثقة
      </p>
    </header>
  );
};

export default Header;
