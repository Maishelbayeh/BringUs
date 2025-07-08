import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="relative w-full">
      <input
        type="text"
        dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}
        placeholder={t('common.search')}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`search-input w-full py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-colors ${
          i18n.language === 'ARABIC' ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'
        }`}
      />
      <MagnifyingGlassIcon 
        className={`search-icon h-5 w-5 text-gray-400 absolute ${
          i18n.language === 'ARABIC' ? 'right-3' : 'left-3'
        } top-1/2 transform -translate-y-1/2`} 
      />
    </div>
  );
};

export default SearchBar; 