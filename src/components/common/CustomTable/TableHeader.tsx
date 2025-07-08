import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, SortConfig, FilterState, ColumnVisibilityState } from './types';

interface TableHeaderProps {
  columns: Column[];
  sortConfig: SortConfig | null;
  filters: FilterState;
  columnVisibility: ColumnVisibilityState;
  onSort: (key: string) => void;
  onFilterClick: (key: string) => void;
  onColumnToggle: (key: string) => void;
  filterIconRefs: React.MutableRefObject<{ [key: string]: HTMLSpanElement | null }>;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortConfig,
  filters,
  columnVisibility,
  onSort,
  onFilterClick,
  onColumnToggle,
  filterIconRefs
}) => {
  const { i18n } = useTranslation();
  const headerRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5M7 13l5 5 5-5" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 inline text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getEyeIcon = (columnKey: string, isVisible: boolean) => {
    if (isVisible) {
      return (
        <svg className="w-4 h-4 text-gray-500 hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-400 hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      );
    }
  };

  return (
    <thead className="rounded-t-lg">
      <tr>
        {columns.map(column => (
          <th
            key={column.key}
            ref={el => (headerRefs.current[column.key] = el)}
            scope="col"
            className="table-header px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition relative whitespace-nowrap"
          >
            <div className="flex items-center gap-1 whitespace-nowrap justify-center">
              <span className={`select-none ${
                (filters[column.key] && filters[column.key] !== '') || (sortConfig?.key === column.key) 
                  ? 'text-primary' 
                  : ''
              }`}>
                {i18n.language === 'ARABIC' ? column.label.ar : column.label.en}
              </span>
              
              {/* أيقونة سهم الترتيب - لا تظهر لعمود العمليات */}
              {column.showControls !== false && (
                <span
                  className={`ml-1 cursor-pointer select-none ${
                    (sortConfig?.key === column.key) ? 'text-primary' : ''
                  }`}
                  onClick={e => { 
                    e.stopPropagation(); 
                    onSort(column.key); 
                  }}
                  title={i18n.language === 'ARABIC' ? 'ترتيب العمود' : 'Sort column'}
                >
                  {getSortIcon(column.key)}
                </span>
              )}
              
              {/* أيقونة فلتر البوب أب - لا تظهر لعمود العمليات */}
              {column.showControls !== false && (
                <span
                  ref={el => (filterIconRefs.current[column.key] = el)}
                  className={`ml-1 cursor-pointer select-none ${
                    (filters[column.key] && filters[column.key] !== '') ? 'text-primary' : ''
                  }`}
                  onClick={e => { 
                    e.stopPropagation(); 
                    onFilterClick(column.key); 
                  }}
                  title={i18n.language === 'ARABIC' ? 'فلترة العمود' : 'Filter column'}
                >
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                </span>
              )}
              
              {/* أيقونة إظهار/إخفاء العمود - لا تظهر لعمود العمليات */}
              {column.showControls !== false && column.hideable !== false && (
                <span
                  className="ml-1 cursor-pointer select-none"
                  onClick={e => { 
                    e.stopPropagation(); 
                    onColumnToggle(column.key); 
                  }}
                  title={i18n.language === 'ARABIC' 
                    ? (columnVisibility[column.key] ? 'إخفاء العمود' : 'إظهار العمود')
                    : (columnVisibility[column.key] ? 'Hide column' : 'Show column')
                  }
                >
                  {getEyeIcon(column.key, columnVisibility[column.key])}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader; 