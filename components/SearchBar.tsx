
import React, { useState } from 'react';
import { Search, LoaderCircle } from 'lucide-react';

interface SearchBarProps {
  onSearch: (question: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [question, setQuestion] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(question);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="اكتب سؤالك الفقهي هنا..."
          className="w-full p-4 pr-12 text-lg text-white bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-md resize-none h-28"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/50 hover:scale-110 active:rotate-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:rotate-0"
        >
          {isLoading ? (
            <LoaderCircle className="w-6 h-6 animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
