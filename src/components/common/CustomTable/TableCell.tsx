import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Column, LinkConfig, ImageModalState } from './types';

interface TableCellProps {
  column: Column;
  item: any;
  linkConfig: LinkConfig[];
  onImageClick: (modal: ImageModalState) => void;
}

const TableCell: React.FC<TableCellProps> = ({ 
  column, 
  item, 
  linkConfig, 
  onImageClick 
}) => {
  const { t, i18n } = useTranslation();

  const renderImage = (src: string, alt: string) => {
    if (!src || src === '-') return '-';
    
    return (
      <div className="table-image-container w-16 h-16 cursor-pointer flex items-center justify-center">
        <img 
          src={src} 
          alt={alt || 'Product'} 
          className="w-full h-full object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.png';
            target.alt = t('common.imageError');
          }}
          onClick={() => onImageClick({ isOpen: true, src, alt })}
        />
        
        {/* Hover overlay */}
        <div className="table-image-overlay">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
    );
  };

  const renderColor = (value: any) => {
    if (!value || value === '-') return '-';
    
    if (typeof value === 'string') {
      return (
        <div className="color-picker">
          <span 
            className="color-circle"
            style={{ background: value }}
          />
          <span className="text-xs text-gray-600">{value}</span>
        </div>
      );
    } else if (Array.isArray(value) && value.length === 2) {
      return (
        <div className="color-picker">
          <span 
            className="gradient-circle"
            style={{ 
              '--color1': value[0],
              '--color2': value[1]
            } as React.CSSProperties}
          />
          <span className="text-xs text-gray-600">Gradient</span>
        </div>
      );
    }
    return '-';
  };

  const renderStatus = (value: any) => {
    let statusValue = value;
    let colorClass = 'bg-gray-200 text-gray-500';
    
    if (value === true) {
      statusValue = i18n.language === 'ARABIC' ? 'نشط' : 'Active';
      colorClass = 'bg-green-100 text-green-700 px-3 py-1 rounded-md';
    }
    else if (value === 'Active') {
      statusValue = i18n.language === 'ARABIC' ? 'نشط' : 'Active';
      colorClass = 'bg-green-100 text-green-700 px-3 py-1 rounded-md';
    }
    else if (value === 'Inactive') {
      statusValue = i18n.language === 'ARABIC' ? 'غير نشط' : 'Inactive';
      colorClass = 'bg-gray-200 text-gray-500 px-3 py-1 rounded-md';
    } else if (value === 'Paid' || value === 'مدفوع') {
      statusValue = i18n.language === 'ARABIC' ? 'مدفوع' : 'Paid';
      colorClass = 'bg-green-100 text-green-700 px-3 py-1 rounded-md';
    } else if (value === 'Unpaid' || value === 'غير مدفوع') {
      statusValue = i18n.language === 'ARABIC' ? 'غير مدفوع' : 'Unpaid';
      colorClass = 'bg-red-100 text-red-700 px-3 py-1 rounded-md';
    }
    
    return (
      <span className={`status-badge ${colorClass}`}>
        {statusValue}
      </span>
    );
  };

  const renderQuantity = (value: any) => {
    const numValue = Number(value);
    let colorClass = 'bg-green-100 text-green-700';
    
    if (numValue < 10) {
      colorClass = 'bg-red-100 text-red-700';
    } else if (numValue <= 50) {
      colorClass = 'bg-orange-100 text-orange-700';
    }
    
    return (
      <span className={`status-badge ${colorClass}`}>
        {value}
      </span>
    );
  };

  const renderVisibility = (value: any) => {
    const isVisible = value === 'ظاهر' || value === 'Visible';
    return (
      <span className={`status-badge ${
        isVisible 
          ? 'bg-primary/10 text-primary' 
          : 'bg-gray-100 text-gray-500'
      }`}>
        {value}
      </span>
    );
  };

  const renderLink = (value: any) => {
    const link = linkConfig.find(lc => lc.column === column.key);
    if (link) {
      return (
        <Link 
          to={link.getPath(item)} 
          className="text-primary underline hover:text-primary-dark transition-colors"
        >
          {value}
        </Link>
      );
    }
    return value;
  };

  const renderContent = () => {
    const value = item[column.key];

    
    // إذا كان هناك render function مخصص
    if (column.render) {
      return column.render(value, item);
    }

    // معالجة الأنواع المختلفة
    switch (column.type) {
      case 'image':
        return renderImage(value, item.name || 'Product');
      
      case 'color':
        return renderColor(value);
      
      case 'status':
        return renderStatus(value);
      
      case 'link':
        return renderLink(value);
      
      default:
        // معالجة الحالات الخاصة
        if (column.key === 'availableQuantity') {
          return renderQuantity(value);
        }
        if (column.key === 'visibility') {
          return renderVisibility(value);
        }
        if (linkConfig.find(lc => lc.column === column.key)) {
          return renderLink(value);
        }
        return value;
    }
  };

  return (
    <td className={`px-6 py-3 text-sm text-gray-900 table-cell truncate max-w-[150px] sm:max-w-[250px] ${
      column.align === 'left' ? 'text-left' : 
      column.align === 'right' ? 'text-right' : 'text-center'
    }`}>
      {renderContent()}
    </td>
  );
};

export default TableCell; 