import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, FilterState } from './types';

interface TableFilterProps {
  activeFilterColumn: string | null;
  columns: Column[];
  filters: FilterState;
  filterValue: string;
  dateFrom: string;
  dateTo: string;
  filteredData: any[];
  onApplyFilter: () => void;
  onClearFilter: () => void;
  onClearSort: () => void;
  onFilterValueChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClose: () => void;
  filterIconRefs: React.MutableRefObject<{ [key: string]: HTMLSpanElement | null }>;
}

const TableFilter: React.FC<TableFilterProps> = ({
  activeFilterColumn,
  columns,
  // filters,
  filterValue,
  dateFrom,
  dateTo,
  filteredData,
  onApplyFilter,
  onClearFilter,
  onClearSort,
  onFilterValueChange,
  onDateFromChange,
  onDateToChange,
  onClose,
  filterIconRefs
}) => {
  const { t, i18n } = useTranslation();
  const popupRef = useRef<HTMLDivElement | null>(null);

  // دالة استخراج القيم الفريدة من أي مصدر بيانات
  const getUniqueColumnValuesFromData = (source: any[], colKey: string): string[] => {
    const values = source.map((item: any) => item[colKey]).filter((v: any) => v !== undefined && v !== null);
    return Array.from(new Set(values)).map(String);
  };

  // لحساب موقع البوب أب كدروب داون
  const getDropdownPosition = () => {
    if (!activeFilterColumn) return { top: 0, left: 0, width: 0 };
    const filterIconRef = filterIconRefs.current[activeFilterColumn];
    if (filterIconRef) {
      // const rect = filterIconRef.getBoundingClientRect();
      const parentCell = filterIconRef.closest('th');
      const cellRect = parentCell?.getBoundingClientRect();
      
      if (cellRect) {
        // جعل الدروب داون يظهر مباشرة تحت خلية الهيدر
        const left = cellRect.left + window.scrollX;
        const top = cellRect.bottom + window.scrollY;
        const width = cellRect.width;
        
        return { top, left, width };
      }
    }
    return { top: 0, left: 0, width: 240 };
  };

  useEffect(() => {
    if (!activeFilterColumn) return;
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFilterColumn, onClose]);

  if (!activeFilterColumn) return null;

  const activeColumn = columns.find(c => c.key === activeFilterColumn);
  const position = getDropdownPosition();

  return (
    <div
      ref={popupRef}
      className="filter-dropdown absolute z-50 bg-white border border-gray-200 rounded-b-lg shadow-lg p-3 min-w-[250px] max-w-[350px] max-h-[350px] overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${Math.max(position.width+70, 200)}px`,
        minWidth: '200px'
      }}
    >
      <div className="mb-3 font-semibold text-gray-800 text-sm border-b border-gray-100 pb-2">
        {t('common.filter')} {activeColumn?.label[i18n.language as 'en' | 'ar']}
      </div>
      
      {activeColumn?.type === 'date' && (
        <div className="flex flex-col gap-2 mb-3">
          <label className="text-xs font-medium text-gray-700">{t('common.from')}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <label className="text-xs font-medium text-gray-700">{t('common.to')}</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      )}
      
      <input
        type="text"
        value={filterValue}
        onChange={e => onFilterValueChange(e.target.value)}
        className={`search-input w-full border border-gray-300 rounded px-2 py-1 mb-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary ${
          i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
        }`}
        placeholder={`${t('common.search')} ${activeColumn?.label[i18n.language === 'ARABIC' ? 'ar' : 'en']}`}
        autoFocus
      />
      
      {/* سيليكت القيم الفريدة */}
      <select
        className={`w-full border border-gray-300 rounded px-2 py-1 mb-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary ${
          i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
        }`}
        value={filterValue}
        onChange={e => onFilterValueChange(e.target.value)}
      >
        <option value="">{t('common.all')}</option>
        {activeFilterColumn === 'stock' ? (
          <>
            <option value="lt10">{i18n.language === 'ARABIC' ? 'أقل من 10' : 'Less than 10'}</option>
            <option value="10to50">{i18n.language === 'ARABIC' ? 'من 10 إلى 50' : '10 to 50'}</option>
            <option value="gt50">{i18n.language === 'ARABIC' ? 'أكثر من 50' : 'More than 50'}</option>
          </>
        ) : (
          getUniqueColumnValuesFromData(filteredData, activeFilterColumn).map((val: string, idx: number) => (
            <option key={idx} value={val}>{val}</option>
          ))
        )}
      </select>
      
      {/* خيارات الترتيب */}
      <div className="flex gap-2 mb-3">
        <button
          className="flex-1 px-2 py-1 rounded border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          onClick={onClearSort}
        >
          {t('common.clearSort')}
        </button>
      </div>
      
      <div className={`flex gap-2 justify-between ${i18n.language === 'ARABIC' ? 'flex-row' : 'flex-row-reverse'}`}>
        <button 
          onClick={onClearFilter} 
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-sm"
        >
          {t('common.clear')}
        </button>
        <button 
          onClick={onApplyFilter} 
          className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition-colors text-sm"
        >
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
};

export default TableFilter; 