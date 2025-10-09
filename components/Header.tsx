
import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="p-6 text-center border-b border-gray-700 shadow-lg bg-gray-900/50">
      <div className="flex items-center justify-center gap-4 mb-2">
        <BookOpen className="w-12 h-12 text-teal-400" />
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">
          رفيقك في الأسئلة والاستفسارات الفقهية
        </h1>
      </div>
      <p className="text-lg text-gray-300">
        مساعدك الخاص في الإجابة عن أسئلتك الفقهية بشكل مختصر وموسع مع ذكر أهم الأدلة لكل مذهب.
      </p>
    </header>
  );
};

export default Header;
