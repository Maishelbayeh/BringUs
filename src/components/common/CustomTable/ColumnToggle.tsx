import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, ColumnVisibilityState } from './types';

interface ColumnToggleProps {
  columns: Column[];
  columnVisibility: ColumnVisibilityState;
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void;
}

const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localVisibility, setLocalVisibility] = useState<ColumnVisibilityState>(columnVisibility);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalVisibility(columnVisibility);
  }, [columnVisibility]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleColumn = (columnKey: string) => {
    const newVisibility = {
      ...localVisibility,
      [columnKey]: !localVisibility[columnKey]
    };
    setLocalVisibility(newVisibility);
  };

  const handleApply = () => {
    onColumnVisibilityChange(localVisibility);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetVisibility: ColumnVisibilityState = {};
    columns.forEach(col => {
      resetVisibility[col.key] = !col.hidden;
    });
    setLocalVisibility(resetVisibility);
  };

  const handleSelectAll = () => {
    const allVisible: ColumnVisibilityState = {};
    columns.forEach(col => {
      allVisible[col.key] = true;
    });
    setLocalVisibility(allVisible);
  };

  const handleSelectNone = () => {
    const allHidden: ColumnVisibilityState = {};
    columns.forEach(col => {
      allHidden[col.key] = false;
    });
    setLocalVisibility(allHidden);
  };

  const visibleColumnsCount = Object.values(localVisibility).filter(Boolean).length;
  const totalColumnsCount = columns.length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-primary/10 focus:outline-none border border-gray-200 transition-colors flex items-center gap-2"
        aria-label="Toggle columns"
        title={t('common.toggleColumns') || 'Toggle Columns'}
      >
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span className="text-xs text-gray-600">
          {visibleColumnsCount}/{totalColumnsCount}
        </span>
      </button>

      {isOpen && (
                 <div
           ref={menuRef}
           className={`absolute z-30 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg py-3 mt-2 ${
             i18n.language === 'ARABIC' ? 'left-0' : 'right-0'
           }`}
           dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}
         >
                     {/* Header */}
           <div className="px-4 pb-2 border-b border-gray-200">
             <h3 className={`font-semibold text-gray-800 text-sm ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
               {t('common.columnVisibility') || 'Column Visibility'}
             </h3>
             <p className={`text-xs text-gray-500 mt-1 ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
               {t('common.selectColumnsToShow') || 'Select columns to show'}
             </p>
           </div>

                     {/* Quick Actions */}
           <div className="px-4 py-2 border-b border-gray-200">
             <div className={`flex gap-2 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
               <button
                 onClick={handleSelectAll}
                 className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
               >
                 {t('common.selectAll') || 'Select All'}
               </button>
               <button
                 onClick={handleSelectNone}
                 className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
               >
                 {t('common.selectNone') || 'Select None'}
               </button>
               <button
                 onClick={handleReset}
                 className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
               >
                 {t('common.reset') || 'Reset'}
               </button>
             </div>
           </div>

          {/* Column List */}
          <div className="max-h-60 overflow-y-auto">
            {columns.map(column => (
              <div
                key={column.key}
                className={`px-4 py-2 hover:bg-gray-50 transition-colors ${
                  !column.hideable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => column.hideable && handleToggleColumn(column.key)}
              >
                                 <div className={`flex items-center justify-between ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`flex items-center gap-2 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                     <input
                       type="checkbox"
                       checked={localVisibility[column.key] || false}
                       onChange={() => column.hideable && handleToggleColumn(column.key)}
                       disabled={!column.hideable}
                       className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                     />
                     <span className={`text-sm text-gray-700 ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                       {typeof column.label === 'string' 
                         ? column.label 
                         : (i18n.language === 'ARABIC' ? column.label.ar : column.label.en)
                       }
                     </span>
                   </div>
                   {!column.hideable && (
                     <span className={`text-xs text-gray-400 ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                       {t('common.required') || 'Required'}
                     </span>
                   )}
                 </div>
              </div>
            ))}
          </div>

                     {/* Footer */}
           <div className="px-4 pt-2 border-t border-gray-200">
             <div className={`flex justify-between items-center ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
               <span className={`text-xs text-gray-500 ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                 {visibleColumnsCount} {t('common.of') || 'of'} {totalColumnsCount} {t('common.columns') || 'columns'}
               </span>
               <div className={`flex gap-2 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <button
                   onClick={() => setIsOpen(false)}
                   className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                 >
                   {t('common.cancel') || 'Cancel'}
                 </button>
                 <button
                   onClick={handleApply}
                   className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                 >
                   {t('common.apply') || 'Apply'}
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ColumnToggle; 