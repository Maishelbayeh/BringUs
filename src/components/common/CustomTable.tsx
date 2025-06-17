import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '@heroicons/react/outline';

interface Column {
  key: string;
  label: {
    en: string;
    ar: string;
  };
  type?: 'text' | 'number' | 'date';
  align?: 'left' | 'center' | 'right';
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const headerRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});
  const popupRef = useRef<HTMLDivElement | null>(null);

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key]).toLowerCase().includes(value.toLowerCase());
    });
    return matchesSearch && matchesFilters;
  });

  // استخراج القيم الفريدة للعمود الحالي
  const getUniqueColumnValues = (colKey: string) => {
    const values = data.map(item => item[colKey]).filter(v => v !== undefined && v !== null);
    return Array.from(new Set(values));
  };

  // تطبيق الفرز الصحيح حسب نوع العمود
  let sortedData = [...filteredData];
  if (sortConfig) {
    const col = columns.find(c => c.key === sortConfig.key);
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      // فرز رقمي إذا كان type number أو القيم كلها أرقام
      const isNumber = col?.type === 'number' || (typeof aValue === 'number' && typeof bValue === 'number');
      if (aValue === bValue) return 0;
      if (isNumber) {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // فرز أبجدي لأول حرف
        const aStr = String(aValue).trim();
        const bStr = String(bValue).trim();
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr, undefined, { sensitivity: 'base' })
          : bStr.localeCompare(aStr, undefined, { sensitivity: 'base' });
      }
    });
  }

  const handleApplyFilter = () => {
    setFilters(prev => ({ ...prev, [activeFilterColumn!]: filterValue }));
    setActiveFilterColumn(null);
  };

  const handleClearFilter = () => {
    setFilters(prev => ({ ...prev, [activeFilterColumn!]: '' }));
    setFilterValue('');
    setActiveFilterColumn(null);
  };

  // لحساب موقع البوب أب بجانب الهيدر
  const getPopupPosition = () => {
    if (!activeFilterColumn) return { top: 0, left: 0 };
    const ref = headerRefs.current[activeFilterColumn];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      return { top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX };
    }
    return { top: 100, left: 100 };
  };

  // إعادة تعريف handleHeaderClick بعد منطق الفرز
  const handleHeaderClick = (colKey: string) => {
    setActiveFilterColumn(colKey);
    setFilterValue(filters[colKey] || '');
  };

  // منطق ترتيب الأعمدة عند الضغط على السهم
  const handleHeaderSort = (colKey: string) => {
    if (sortConfig && sortConfig.key === colKey) {
      // عكس الاتجاه
      setSortConfig({ key: colKey, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key: colKey, direction: 'asc' });
    }
  };

  // زر لمسح الترتيب
  const handleClearSort = () => {
    setSortConfig(null);
    setActiveFilterColumn(null);
  };

  // إغلاق البوب أب عند الضغط خارج النافذة
  useEffect(() => {
    if (!activeFilterColumn) return;
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActiveFilterColumn(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFilterColumn]);

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {Object.entries(filters).filter(([_, v]) => v).length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 items-center">
          {Object.entries(filters).filter(([_, v]) => v).map(([key, value]) => {
            const col = columns.find(c => c.key === key);
            return (
              <span key={key} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                <span className="mr-1">{(i18n.language === 'ARABIC' ? col?.label.ar : col?.label.en) + ': ' + value}</span>
                <button
                  className="ml-2 text-primary hover:text-red-500 focus:outline-none"
                  onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                  title="إزالة الفلتر"
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            className="ml-4 text-xs text-gray-500 hover:text-red-600 underline"
            onClick={() => setFilters({})}
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* Table */}
      <div className="relative">
        <table
          className="min-w-full divide-y divide-gray-200"
          dir={i18n.language === 'ARABIC' || i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  ref={el => (headerRefs.current[column.key] = el)}
                  scope="col"
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium uppercase tracking-wider transition relative ${((filters[column.key] && filters[column.key] !== '') || (sortConfig?.key === column.key)) ? 'text-primary' : 'text-gray-500'}`}
                >
                  <span className={`inline-block select-none ${(filters[column.key] && filters[column.key] !== '') || (sortConfig?.key === column.key) ? 'text-primary' : ''}`}>
                    {i18n.language === 'ARABIC' ? column.label.ar : column.label.en}
                  </span>
                  {/* أيقونة سهم الترتيب */}
                  <span
                    className={`inline-block ml-1 cursor-pointer select-none ${(sortConfig?.key === column.key) ? 'text-primary' : ''}`}
                    onClick={e => { e.stopPropagation(); handleHeaderSort(column.key); }}
                  >
                    {sortConfig?.key === column.key ? (
                      sortConfig.direction === 'asc' ? (
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      )
                    ) : (
                      <svg className="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5M7 13l5 5 5-5" /></svg>
                    )}
                  </span>
                  {/* أيقونة فلتر البوب أب */}
                  <span
                    className={`inline-block ml-1 cursor-pointer select-none ${(filters[column.key] && filters[column.key] !== '') ? 'text-primary' : ''}`}
                    onClick={e => { e.stopPropagation(); handleHeaderClick(column.key); }}
                  >
                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" /></svg>
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.ACTIONS')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-${column.align || 'left'} text-sm text-gray-900`}
                  >
                    {item[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <span className="sr-only">{t('common.edit')}</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <span className="sr-only">{t('common.delete')}</span>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Popup Filter */}
        {activeFilterColumn && (
          <div
            ref={popupRef}
            className="fixed z-50 bg-white border rounded-lg shadow p-4 min-w-[240px]"
            style={{ ...getPopupPosition() }}
          >
            <div className="mb-2 font-bold text-primary text-sm">فلترة {columns.find(c => c.key === activeFilterColumn)?.label[i18n.language as 'en' | 'ar']}</div>
            <input
              type="text"
              value={filterValue}
              onChange={e => {
                setFilterValue(e.target.value);
              }}
              className="w-full border rounded px-2 py-1 mb-2 focus:ring-primary focus:border-primary"
              placeholder={`بحث في ${columns.find(c => c.key === activeFilterColumn)?.label[i18n.language as 'en' | 'ar']}`}
              autoFocus
            />
            {/* سيليكت القيم الفريدة */}
            <select
              className="w-full border rounded px-2 py-1 mb-2 focus:ring-primary focus:border-primary"
              value={filterValue}
              onChange={e => {
                setFilterValue(e.target.value);
                setFilters(prev => ({ ...prev, [activeFilterColumn]: e.target.value }));
                setActiveFilterColumn(null);
              }}
            >
              <option value="">كل القيم</option>
              {getUniqueColumnValues(activeFilterColumn).map((val, idx) => (
                <option key={idx} value={val}>{val}</option>
              ))}
            </select>
            {/* خيارات الترتيب */}
            <div className="flex gap-2 mb-2">
              <button
                className="flex-1 px-2 py-1 rounded border bg-gray-100 text-gray-700"
                onClick={handleClearSort}
              >
                مسح الترتيب
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleClearFilter} className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">مسح</button>
              <button onClick={() => setActiveFilterColumn(null)} className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition">إغلاق</button>
              <button onClick={handleApplyFilter} className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition">تطبيق</button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {t('common.showing')} <span className="font-medium">{filteredData.length}</span> {t('common.of')} <span className="font-medium">{data.length}</span> {t('common.results')}
        </div>
      </div>
    </div>
  );
};

export default CustomTable; 