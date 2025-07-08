import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CustomSelect from './CustomSelect';
import { useTranslation } from 'react-i18next';

interface HeaderWithActionProps {
  title: string;
  addLabel?: string;
  onAdd?: () => void;
  isRtl?: boolean;
  className?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  showSort?: boolean;
  sortValue?: string;
  onSortChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sortOptions?: { value: string; label: string }[];
  onDownload?: () => void;
  categories?: { id: number; name: string }[];
  selectedCategoryId?: string;
  onCategoryChange?: (id: string) => void;
  count?: number;
  loading?: boolean;
}

const HeaderWithAction: React.FC<HeaderWithActionProps> = ({
  title,
  addLabel,
  onAdd,
  isRtl,
  className = '',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = '',
  showSort = false,
  sortValue = '',
  onSortChange,
  sortOptions = [],
  onDownload,
  categories,
  selectedCategoryId,
  onCategoryChange,
  count,
  loading,
}) => {
  const [isSortOpen,   ] = useState(false);
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  return (
    <>
      <div className={`mb-4 rounded-lg px-3 pt-4 flex items-center justify-between bg-primary/10 gap-2 sm:gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${className} flex-wrap`}>
        <div className={`flex items-center gap-1 sm:gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'} mb-4 min-w-0 flex-1`}>
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold text-primary flex items-center gap-1 sm:gap-2 min-w-0`} dir={isRtl ? 'rtl' : 'ltr'}>
            <span className="truncate">{title}</span>
            {typeof count === 'number' && (
              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary text-white text-xs font-semibold shadow-sm flex-shrink-0">{count}</span>
            )}
          </h1>
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center justify-center rounded-full p-1 text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
              title={isRtl ? 'تنزيل' : 'Download'}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            </button>
          )}
        </div>
        <div className={`flex flex-wrap items-center gap-1 sm:gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
          {showSearch && (
            <input
              type="text"
              value={searchValue}
              onChange={onSearchChange}
              onBlur={onSearchChange}
              placeholder={searchPlaceholder}
              className={`w-32 sm:w-48 md:w-80 appearance-none bg-gray-50 border text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 sm:p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary transition-all duration-200 flex-shrink-0`}
              style={isRtl ? { direction: 'rtl' } : {}}
            />
          )}
          {showSort && sortOptions && (
            <div className="w-24 sm:w-32 md:w-44 flex-shrink-0">
              <CustomSelect
                value={sortValue || ''}
                onChange={onSortChange || (() => {})}
                options={sortOptions}
                className="text-xs sm:text-sm"
                icon={
                  isSortOpen ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 15l-7-7-7 7" /></svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  )
                }
              />
            </div>
          )}
          {categories && (
           <div className="w-24 sm:w-32 md:w-44 flex-shrink-0"> 
             <CustomSelect
               value={selectedCategoryId || ''}
               onChange={e => onCategoryChange && onCategoryChange(e.target.value)}
               options={[{ value: '', label: currentLanguage === 'ARABIC' ? 'الكل' : 'All' }, ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))]}
               className="text-xs sm:text-sm"
             />
           </div>
          )}
          {onAdd && <button
            onClick={onAdd}
            disabled={loading}
            className={`flex items-center gap-1 sm:gap-2 bg-primary text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-dark transition ${isRtl ? 'flex-row-reverse' : 'flex-row'} text-xs sm:text-sm font-medium flex-shrink-0 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">{isRtl ? 'جاري...' : 'Loading...'}</span>
              </>
            ) : isRtl ? (
              <>
                <span className="hidden sm:inline">{addLabel}</span>
                <span className="sm:hidden text-lg font-bold">+</span>
                <PlusIcon className="hidden sm:block h-4 w-4 sm:h-5 sm:w-5" />
              </>
            ) : (
              <>
                <PlusIcon className="hidden sm:block h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{addLabel}</span>
                <span className="sm:hidden text-lg font-bold">+</span>
              </>
            )}
          </button>}
        </div>
      </div>
    </>
  );
};

export default HeaderWithAction; 