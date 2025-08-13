import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTableProps, SortConfig, FilterState, ImageModalState, ColumnVisibilityState } from './types';
import SearchBar from './SearchBar';
import TableActions from './TableActions';
import ActiveFilters from './ActiveFilters';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TablePagination from './TablePagination';
import TableFilter from './TableFilter';
import ImageModal from './ImageModal';
import ColumnToggle from './ColumnToggle';
import HiddenColumnsBar from './HiddenColumnsBar';

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  onFilteredDataChange,
  linkConfig = [],
  showColumnToggle = false,
  showHiddenColumnsBar = true,
  autoScrollToFirst = true,
  onColumnsChange,
}) => {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imageModal, setImageModal] = useState<ImageModalState>({ isOpen: false, src: '', alt: '' });
  const lastSent = useRef<any[]>([]);
  const rowsPerPage = 10;
  const filterIconRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // حالة إظهار/إخفاء الأعمدة
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() => {
    const initial: ColumnVisibilityState = {};
    columns.forEach(col => {
      initial[col.key] = col.hidden !== true; // إذا كان hidden = true، اجعل العمود مخفي، وإلا اجعله ظاهر
    });
    return initial;
  });

  useEffect(() => {
    // تحديث الأعمدة عند تغيير الرؤية
    if (onColumnsChange) {
      const newColumns = columns.map(col => ({ ...col, hidden: !columnVisibility[col.key] }));
      onColumnsChange(newColumns);
    }
    // eslint-disable-next-line
  }, [columnVisibility]);

  // الأعمدة الظاهرة فقط
  const visibleColumns = columns.filter(col => columnVisibility[col.key] === true);

  // دالة استخراج القيم الفريدة من أي مصدر بيانات
  const getUniqueColumnValuesFromData = (source: any[], colKey: string): string[] => {
    const values = source.map((item: any) => item[colKey]).filter((v: any) => v !== undefined && v !== null);
    return Array.from(new Set(values)).map(String);
  };

  // فلترة البيانات
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

  // معالجات الأحداث
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
    setFilters(prev => ({ 
      ...prev, 
      [activeFilterColumn!]: '', 
      [`${activeFilterColumn}_from`]: '', 
      [`${activeFilterColumn}_to`]: '' 
    }));
    setFilterValue('');
    setDateFrom('');
    setDateTo('');
    setActiveFilterColumn(null);
  };

  const handleHeaderClick = (colKey: string) => {
    setActiveFilterColumn(colKey);
    setFilterValue(filters[colKey] || '');
    setDateFrom(filters[`${colKey}_from`] || '');
    setDateTo(filters[`${colKey}_to`] || '');
  };

  const handleHeaderSort = (colKey: string) => {
    if (sortConfig && sortConfig.key === colKey) {
      setSortConfig({ key: colKey, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key: colKey, direction: 'asc' });
    }
  };

  const handleClearSort = () => {
    setSortConfig(null);
    setActiveFilterColumn(null);
  };

  const handleRemoveFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  const handleImageClick = (modal: ImageModalState) => {
    setImageModal(modal);
  };

  const handleCloseImageModal = () => {
    setImageModal({ isOpen: false, src: '', alt: '' });
  };

  // معالج إظهار/إخفاء العمود الفردي
  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // دالة التمرير إلى العمود الأول
  const scrollToFirstColumn = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
  };

  // Effects
  useEffect(() => {
    if (onFilteredDataChange && typeof onFilteredDataChange === 'function') {
      // تحقق من أن البيانات قد تغيرت فعلاً قبل إرسالها
      const isSame = lastSent.current.length === filteredData.length && 
                    JSON.stringify(lastSent.current) === JSON.stringify(filteredData);
      if (!isSame) {
        // تأخير قليل لتجنب الاستدعاءات المتكررة
        const timeoutId = setTimeout(() => {
          onFilteredDataChange(filteredData);
          lastSent.current = [...filteredData];
        }, 200); // زيادة التأخير إلى 200 مللي ثانية
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [filteredData, onFilteredDataChange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, JSON.stringify(filters)]);

  // التمرير إلى العمود الأول عند تغيير البيانات أو الفلاتر
  useEffect(() => {
    if (autoScrollToFirst) {
      scrollToFirstColumn();
    }
  }, [data, searchTerm, JSON.stringify(filters), JSON.stringify(columnVisibility), autoScrollToFirst]);

  return (
    <div className="w-full">
      {/* Search and Filter Bar + Actions */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className={`flex-1 flex items-center gap-2 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <TableActions 
            data={sortedData}
            columns={visibleColumns}
          />
          {showColumnToggle && (
            <ColumnToggle
              columns={columns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          )}
        </div>
      </div>

      {/* Active Filters Bar */}
      <ActiveFilters
        filters={filters}
        columns={visibleColumns}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Hidden Columns Bar */}
      {showHiddenColumnsBar && (
        <HiddenColumnsBar
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnToggle={handleColumnToggle}
        />
      )}

      {/* Table */}
      <div ref={tableContainerRef} className="relative overflow-x-auto w-full bg-primary/5 rounded-xl custom-table-scroll">
        <div className="min-w-[600px] w-full p-2">
          <table
            className="w-full"
            dir={i18n.language === 'ARABIC' || i18n.language === 'ar' ? 'rtl' : 'ltr'}
          >
            <TableHeader
              columns={visibleColumns}
              sortConfig={sortConfig}
              filters={filters}
              columnVisibility={columnVisibility}
              onSort={handleHeaderSort}
              onFilterClick={handleHeaderClick}
              onColumnToggle={handleColumnToggle}
              filterIconRefs={filterIconRefs}
            />
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, idx) => (
                <TableRow
                  key={idx}
                  item={item}
                  columns={visibleColumns}
                  linkConfig={linkConfig}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onImageClick={handleImageClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Popup */}
      <TableFilter
        activeFilterColumn={activeFilterColumn}
        columns={visibleColumns}
        filters={filters}
        filterValue={filterValue}
        dateFrom={dateFrom}
        dateTo={dateTo}
        filteredData={filteredData}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        onClearSort={handleClearSort}
        onFilterValueChange={setFilterValue}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClose={() => setActiveFilterColumn(null)}
        filterIconRefs={filterIconRefs}
      />

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Image Modal */}
      <ImageModal
        modal={imageModal}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};

export default CustomTable; 