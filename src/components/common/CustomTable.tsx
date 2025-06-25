import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import * as XLSX from 'xlsx';
import 'jspdf-autotable';

import Papa from 'papaparse';

interface Column {
  key: string;
  label: {
    en: string;
    ar: string;
  };
  type?: 'text' | 'number' | 'date' | 'image' | 'color' | 'link' | 'status';
  render?: (value: any, item: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface LinkConfig {
  column: string;
  getPath: (row: any) => string;
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onFilteredDataChange?: (filtered: any[]) => void;
  linkConfig?: LinkConfig[];
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  onFilteredDataChange,
  linkConfig = [],
}) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const headerRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const lastSent = useRef<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // دالة استخراج القيم الفريدة من أي مصدر بيانات
  const getUniqueColumnValuesFromData = (source: any[], colKey: string): string[] => {
    const values = source.map((item: any) => item[colKey]).filter((v: any) => v !== undefined && v !== null);
    return Array.from(new Set(values)).map(String);
  };

  
  const filteredData: any[] = data.filter((item: any) => {
    const matchesSearch = Object.values(item).some((value: any) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilters: boolean = Object.entries(filters).every(([key, value]: [string, string]) => {
      if (!value) return true;
      // دعم فلترة الفترة الزمنية
      if (key.endsWith('_from')) {
        const colKey = key.replace('_from', '');
        if (!item[colKey]) return false;
        return item[colKey] >= value;
      }
      if (key.endsWith('_to')) {
        const colKey = key.replace('_to', '');
        if (!item[colKey]) return false;
        return item[colKey] <= value;
      }
      // دعم خاص لفلاتر الكمية المتبقية
      if (key === 'stock') {
        if (value === 'lt10') return Number(item[key]) < 10;
        if (value === '10to50') return Number(item[key]) >= 10 && Number(item[key]) <= 50;
        if (value === 'gt50') return Number(item[key]) > 50;
      }
      // إذا كانت القيمة من السيليكت (موجودة ضمن unique values)، استخدم المطابقة التامة
      const uniqueValues = getUniqueColumnValuesFromData(data, key);
      if (uniqueValues.includes(value)) {
        return String(item[key]) === value;
      }
      // وإلا ابقِ البحث النصي
      return String(item[key]).toLowerCase().includes(value.toLowerCase());
    });
    return matchesSearch && matchesFilters;
  });

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

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleApplyFilter = () => {
    if (activeFilterColumn) {
      const col = columns.find(c => c.key === activeFilterColumn);
      if (col?.type === 'date') {
        setFilters(prev => ({
          ...prev,
          [activeFilterColumn]: filterValue,
          [`${activeFilterColumn}_from`]: dateFrom,
          [`${activeFilterColumn}_to`]: dateTo,
        }));
      } else {
        setFilters(prev => ({ ...prev, [activeFilterColumn]: filterValue }));
      }
    }
    setActiveFilterColumn(null);
  };

  const handleClearFilter = () => {
    setFilters(prev => ({ ...prev, [activeFilterColumn!]: '', [`${activeFilterColumn}_from`]: '', [`${activeFilterColumn}_to`]: '' }));
    setFilterValue('');
    setDateFrom('');
    setDateTo('');
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
    setDateFrom(filters[`${colKey}_from`] || '');
    setDateTo(filters[`${colKey}_to`] || '');
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

  useEffect(() => {
    if (onFilteredDataChange) {
      const isSame = lastSent.current.length === filteredData.length;
      if (!isSame) {
        onFilteredDataChange(filteredData);
        lastSent.current = filteredData;
      }
    }
  }, [filteredData, onFilteredDataChange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, JSON.stringify(filters)]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // SVGs للأسهم
  const ArrowRight = (
    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
  );
  const ArrowLeft = (
    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
  );

  return (
    <div className="w-full">
      {/* Search and Filter Bar + Actions */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className={`flex-1 flex items-center gap-2 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="relative w-full">
            <input
              type="text"
              dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary ${i18n.language === 'ARABIC' ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'}`}
            />
            <MagnifyingGlassIcon className={`h-5 w-5 text-gray-400 absolute ${i18n.language === 'ARABIC' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`} />
          </div>
          {/* Table Actions Menu Button */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-primary/10 focus:outline-none border border-gray-200"
              aria-label="Table actions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            {menuOpen && (
              <div
                ref={menuRef}
                className={`absolute z-20 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg py-2 mt-2 ${i18n.language === 'ARABIC' ? '' : 'left-[-200px]'}`}
              >
                {/* Excel Download */}
                <button
                  onClick={() => {
                    const exportData = sortedData.map((row: any) => {
                      const obj: any = {};
                      columns.forEach(col => {
                        obj[i18n.language === 'ARABIC' ? col.label.ar : col.label.en] = row[col.key];
                      });
                      return obj;
                    });
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');
                    XLSX.writeFile(workbook, `table_export.xlsx`);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-primary/10 text-primary"
                >
                    {t('common.downloadExcel')}
                </button>
                {/* CSV Download */}
                <button
                  onClick={() => {
                    const exportData = sortedData.map((row: any) => {
                      const obj: any = {};
                      columns.forEach(col => {
                        obj[i18n.language === 'ARABIC' ? col.label.ar : col.label.en] = row[col.key];
                      });
                      return obj;
                    });
                    let csv = Papa.unparse(exportData);
                    // Add UTF-8 BOM for Excel Arabic support
                    csv = '\uFEFF' + csv;
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute('download', 'table_export.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-primary/10 text-primary"
                >
                 {t('common.downloadCSV')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {Object.entries(filters).filter(([_, v]) => v).length > 0 && (
        <div className={`mb-2 flex flex-wrap gap-2 items-center ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
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
      <div className="relative overflow-x-auto w-full bg-primary/5 rounded-xl custom-table-scroll">
        <div className="min-w-[600px] w-full p-2">
          <table
            className="w-full"
            dir={i18n.language === 'ARABIC' || i18n.language === 'ar' ? 'rtl' : 'ltr'}
          >
            <thead className="rounded-t-lg">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    ref={el => (headerRefs.current[column.key] = el)}
                    scope="col"
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition relative whitespace-nowrap`}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap justify-center">
                      <span className={`select-none ${(filters[column.key] && filters[column.key] !== '') || (sortConfig?.key === column.key) ? 'text-primary' : ''}`}>
                        {i18n.language === 'ARABIC' ? column.label.ar : column.label.en}
                      </span>
                      {/* أيقونة سهم الترتيب */}
                      <span
                        className={`ml-1 cursor-pointer select-none ${(sortConfig?.key === column.key) ? 'text-primary' : ''}`}
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
                        className={`ml-1 cursor-pointer select-none ${(filters[column.key] && filters[column.key] !== '') ? 'text-primary' : ''}`}
                        onClick={e => { e.stopPropagation(); handleHeaderClick(column.key); }}
                      >
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" /></svg>
                      </span>
                    </div>
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
              {paginatedData.map((item, idx) => (
                <tr key={idx} className="mb-4 bg-white rounded-lg shadow border-0">
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-6 py-3 text-sm text-gray-900 ${column.align === 'left' ? 'text-left' : column.align === 'right' ? 'text-right' : 'text-center'}`}
                    >
                      {column.render ? (
                        column.render(item[column.key], item)
                      ) : column.key === 'color' ? (() => {
                        const value = item[column.key];
                        if (!value || value === '-') return '-';
                        if (typeof value === 'string') {
                          return (
                            <span className="flex items-center gap-2 justify-center">
                              <span style={{ background: value, width: 22, height: 22, borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }} />
                            </span>
                          );
                        } else if (Array.isArray(value) && value.length === 2) {
                          return (
                            <span className="flex items-center gap-2 justify-center">
                              <span style={{ background: `linear-gradient(90deg, ${value[0]} 50%, ${value[1]} 50%)`, width: 22, height: 22, borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }} />
                            </span>
                          );
                        }
                        return '-';
                      })() :
                      column.type === 'image' ? (
                        item[column.key] ? (
                          <img src={item[column.key]} alt="product" style={{ textAlign: 'center', width: 70, height: 70, objectFit: 'contain', borderRadius: '50%', display: 'block', margin: '0 auto' }} />
                        ) : '-'
                      ) :
                      (() => {
                        const link = linkConfig.find(lc => lc.column === column.key);
                        if (link) {
                          return (
                            <Link to={link.getPath(item)} className="text-primary underline hover:text-primary-dark">
                              {item[column.key]}
                            </Link>
                          );
                        }
                        // منطق الحالات الخاصة (status, stock, visibility)
                        if (column.key === 'status') {
                          // دعم القيم A/I أو Active/Inactive أو Paid/Unpaid
                          let statusValue = item[column.key];
                          let colorClass = 'bg-gray-200 text-gray-500';
                          if (statusValue === 'A' || statusValue === 'Active' || statusValue === 'نشط') {
                            statusValue = i18n.language === 'ARABIC' ? 'نشط' : 'Active';
                            colorClass = 'bg-green-100 text-green-700';
                          } else if (statusValue === 'I' || statusValue === 'Inactive' || statusValue === 'غير نشط') {
                            statusValue = i18n.language === 'ARABIC' ? 'غير نشط' : 'Inactive';
                            colorClass = 'bg-gray-200 text-gray-500';
                          } else if (statusValue === 'Paid' || statusValue === 'مدفوع') {
                            statusValue = i18n.language === 'ARABIC' ? 'مدفوع' : 'Paid';
                            colorClass = 'bg-green-100 text-green-700';
                          } else if (statusValue === 'Unpaid' || statusValue === 'غير مدفوع') {
                            statusValue = i18n.language === 'ARABIC' ? 'غير مدفوع' : 'Unpaid';
                            colorClass = 'bg-red-100 text-red-700';
                          }
                          return (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
                            >
                              {statusValue}
                            </span>
                          );
                        } else if (column.key === 'availableQuantity') {
                          return (
                            <span
                              className={
                                Number(item[column.key]) < 10
                                  ? 'bg-red-100 text-red-700 px-6 py-1 rounded-full'
                                  : Number(item[column.key]) <= 50
                                    ? 'bg-orange-100 text-orange-700 px-6 py-1 rounded-full'
                                    : 'bg-green-100 text-green-700 px-6 py-1 rounded-full'
                              }
                            >
                              {item[column.key]}
                            </span>
                          );
                        } else if (column.key === 'visibility') {
                          return (
                            <span
                              className={
                                item[column.key] === 'ظاهر' || item[column.key] === 'Visible'
                                  ? 'bg-primary/10 text-primary px-3 py-1 rounded-full font-bold'
                                  : 'bg-gray-100 text-gray-300 px-3 py-1 rounded-full font-bold'
                              }
                            >
                              {item[column.key]}
                            </span>
                          );
                        } else {
                          return item[column.key];
                        }
                      })()}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium">
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
              <div className="mb-2 font-bold text-primary text-sm">{t('common.filter')} {columns.find(c => c.key === activeFilterColumn)?.label[i18n.language as 'en' | 'ar']}</div>
              {columns.find(c => c.key === activeFilterColumn)?.type === 'date' && (
                <div className="flex flex-col gap-2 mb-2">
                  <label className="text-xs text-gray-600">{t('common.from')}</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full border rounded px-2 py-1 focus:ring-primary focus:border-primary"
                  />
                  <label className="text-xs text-gray-600">{t('common.to')}</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full border rounded px-2 py-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
              <input
                type="text"
                value={filterValue}
                onChange={e => {
                  setFilterValue(e.target.value);
                }}
                className={`w-full border rounded px-2 py-1 mb-2 focus:ring-primary focus:border-primary ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}
                placeholder={`${t('common.search')} ${columns.find(c => c.key === activeFilterColumn)?.label[i18n.language === 'ARABIC' ? 'ar' : 'en']}`}
                autoFocus
              />
              {/* سيليكت القيم الفريدة */}
              <select
                className={`w-full border rounded px-2 py-1 mb-2 focus:ring-primary focus:border-primary ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}
                value={filterValue}
                onChange={e => {
                  setFilterValue(e.target.value);
                  // منطق خاص للكمية المتبقية
                  if (activeFilterColumn === 'stock') {
                    setFilters(prev => ({ ...prev, [activeFilterColumn]: e.target.value }));
                    setActiveFilterColumn(null);
                    return;
                  }
                  setFilters(prev => ({ ...prev, [activeFilterColumn]: e.target.value }));
                  setActiveFilterColumn(null);
                }}
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
              <div className="flex gap-2 mb-2">
                <button
                  className="flex-1 px-2 py-1 rounded border bg-gray-100 text-gray-700"
                  onClick={handleClearSort}
                >
                  {t('common.clearSort')}
                </button>
              </div>
              <div className={`flex gap-2 justify-between ${i18n.language === 'ARABIC' ? 'flex-row' : 'flex-row-reverse'}`}>
                <button onClick={handleClearFilter} className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition">{t('common.clear')}</button>
              
                <button onClick={handleApplyFilter} className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition">{t('common.apply')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border bg-white text-primary disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {ArrowLeft}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-white text-primary'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border bg-white text-primary disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {ArrowRight}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable; 