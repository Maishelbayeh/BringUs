import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Column } from './types';

interface TableActionsProps {
  data: any[];
  columns: Column[];
}

const TableActions: React.FC<TableActionsProps> = ({ data, columns }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const handleExcelExport = () => {
    const exportData = data.map((row: any) => {
      const obj: any = {};
      columns.forEach(col => {
        obj[i18n.language === 'ARABIC' ? col.label.ar : col.label.en] = row[col.key];
      });
      return obj;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');
    XLSX.writeFile(workbook, `table_export_${Date.now()}.xlsx`);
    setMenuOpen(false);
  };

  const handleCSVExport = () => {
    const exportData = data.map((row: any) => {
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
    link.setAttribute('download', `table_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={menuButtonRef}
        onClick={() => setMenuOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-primary/10 focus:outline-none border border-gray-200 transition-colors"
        aria-label="Table actions"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-primary" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <circle cx="12" cy="5" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      
      {menuOpen && (
        <div
          ref={menuRef}
          className={`absolute z-20 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg py-2 mt-2 ${
            i18n.language === 'ARABIC' ? 'left-0' : 'right-0'
          }`}
        >
          {/* Excel Download */}
          <button
            onClick={handleExcelExport}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('common.downloadExcel')}
          </button>
          
          {/* CSV Download */}
          <button
            onClick={handleCSVExport}
            className="w-full text-left px-4 py-2 hover:bg-primary/10 text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('common.downloadCSV')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TableActions; 