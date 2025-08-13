import React from 'react';
import { useTranslation } from 'react-i18next';
import { Column, FilterState } from './types';

interface ActiveFiltersProps {
  filters: FilterState;
  columns: Column[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ 
  filters, 
  columns, 
  onRemoveFilter, 
  onClearAll 
}) => {
  const { t, i18n } = useTranslation();

  const activeFilters = Object.entries(filters).filter(([_, v]) => v);

  if (activeFilters.length === 0) return null;

  return (
    <div className={`mb-2 flex flex-wrap gap-2 items-center ${
      i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'
    }`}>
      {activeFilters.map(([key, value]) => {
        const col = columns.find(c => c.key === key);
        const displayKey = key.replace('_from', '').replace('_to', '');
        const isDateRange = key.endsWith('_from') || key.endsWith('_to');
        
        if (isDateRange && !key.endsWith('_from')) return null; // عرض مرة واحدة فقط للفترة الزمنية
        
        let displayValue = value;
        if (isDateRange) {
          const fromValue = filters[`${displayKey}_from`];
          const toValue = filters[`${displayKey}_to`];
          if (fromValue && toValue) {
            displayValue = `${fromValue} - ${toValue}`;
          } else if (fromValue) {
            displayValue = `من ${fromValue}`;
          } else if (toValue) {
            displayValue = `إلى ${toValue}`;
          }
        }

        return (
          <span 
            key={key} 
            className="active-filter flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
          >
                         <span className={i18n.language === 'ARABIC' ? 'ml-1' : 'mr-1'}>
               {(typeof col?.label === 'string' 
                 ? col.label 
                 : (i18n.language === 'ARABIC' ? col?.label.ar : col?.label.en)
               ) + ': ' + displayValue}
             </span>
                         <button
               className={`${i18n.language === 'ARABIC' ? 'mr-2' : 'ml-2'} text-primary hover:text-red-500 focus:outline-none transition-colors`}
               onClick={() => {
                 if (isDateRange) {
                   onRemoveFilter(`${displayKey}_from`);
                   onRemoveFilter(`${displayKey}_to`);
                 } else {
                   onRemoveFilter(key);
                 }
               }}
               title={t('common.removeFilter')}
             >
               ×
             </button>
          </span>
        );
      })}
      
             <button
         className={`${i18n.language === 'ARABIC' ? 'mr-4' : 'ml-4'} text-xs text-gray-500 hover:text-red-600 underline transition-colors`}
         onClick={onClearAll}
       >
         {t('common.clearAll')}
       </button>
    </div>
  );
};

export default ActiveFilters; 