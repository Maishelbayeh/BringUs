import React from 'react';
import { useTranslation } from 'react-i18next';
import { Column, ColumnVisibilityState } from './types';

interface HiddenColumnsBarProps {
  columns: Column[];
  columnVisibility: ColumnVisibilityState;
  onColumnToggle: (columnKey: string) => void;
}

const HiddenColumnsBar: React.FC<HiddenColumnsBarProps> = ({
  columns,
  columnVisibility,
  onColumnToggle
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-EG' || i18n.language === 'ARABIC';
  // الأعمدة المخفية فقط
  const hiddenColumns = columns.filter(col => 
    col.hideable !== false && !columnVisibility[col.key]
  );

  if (hiddenColumns.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
                 <span className={`text-sm font-medium text-gray-700 ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
           {i18n.language === 'ARABIC' ? 'الأعمدة المخفية' : 'Hidden Columns'}
         </span>
        <span className="text-xs text-gray-500">
          ({hiddenColumns.length})
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hiddenColumns.map(column => (
                     <button
             key={column.key}
             onClick={() => onColumnToggle(column.key)}
             className={`inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-primary transition-colors ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}
             title={i18n.language === 'ARABIC' ? 'إظهار العمود' : 'Show column'}
           >
             <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
             <span className={i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}>
               {typeof column.label === 'string' 
                 ? column.label 
                 : (i18n.language === 'ARABIC' ? column.label.ar : column.label.en)
               }
             </span>
           </button>
        ))}
      </div>
    </div>
  );
};

export default HiddenColumnsBar; 