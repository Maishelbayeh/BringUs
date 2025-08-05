import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * CustomSelect Component with Search Functionality
 * 
 * Usage:
 * // Regular select (non-searchable)
 * <CustomSelect
 *   label="Select Category"
 *   value={selectedCategory}
 *   onChange={handleCategoryChange}
 *   options={categoryOptions}
 * />
 * 
 * // Searchable select
 * <CustomSelect
 *   label="Select Product"
 *   value={selectedProduct}
 *   onChange={handleProductChange}
 *   options={productOptions}
 *   searchable={true}
 *   placeholder="Search for a product..."
 * />
 */

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  id?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  name?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  id, 
  icon, 
  className = '', 
  disabled, 
  error,
  multiple = false,
  searchable = false,
  placeholder,
  name
}) => {
  const { i18n, t } = useTranslation();
  const isMultiple = !!multiple;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const selectRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchable && searchTerm) {
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !option.value.startsWith('separator-')
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, searchable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleOptionClick = (optionValue: string) => {
    const event = {
      target: { 
        value: optionValue,
        name: name || ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSelectedLabel = () => {
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} selected` : placeholder || t('common.selectOption', 'Select an option');
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder || t('common.selectOption', 'Select an option');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (!searchable) {
    // Return original select for non-searchable version
    return (
      <div className={`w-full mb-4 ${className}`}>
        {label && (
          <label 
            htmlFor={id} 
            className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${
              i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            className={`appearance-none border text-sm rounded-lg block w-full py-2.5 pr-10 pl-10 transition-all duration-200
              ${disabled 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary'
              }
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary`
            }
            style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
            disabled={disabled}
            multiple={isMultiple}
          >
            {!isMultiple && (
              <option value="">{t('common.selectOption', 'Select an option')}</option>
            )}
            {options.map(opt => (
              <option 
                key={opt.value} 
                value={opt.value}
                disabled={opt.value.startsWith('separator-')}
                style={{
                  fontFamily: opt.value.startsWith('separator-') ? 'monospace' : 'inherit',
                  color: opt.value.startsWith('separator-') ? '#6b7280' : 'inherit',
                  fontSize: opt.value.startsWith('separator-') ? '0.75rem' : 'inherit',
                  backgroundColor: opt.value.startsWith('separator-') ? '#f9fafb' : 'inherit'
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <span 
            className={`pointer-events-none absolute inset-y-0 flex items-center ${
              i18n.language === 'ARABIC' ? 'right-3' : 'left-3'
            }`} 
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            {icon || (
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            )}
          </span>
        </div>
        {error && (
          <p className={`mt-1 text-sm text-red-600 ${
            i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
          }`}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Searchable version
  return (
    <div className={`w-full mb-4 ${className}`} ref={selectRef}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${
            i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={handleSelectClick}
          className={`border text-sm rounded-lg block w-full py-2.5 pr-10 pl-10 transition-all duration-200 cursor-pointer
            ${disabled 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-gray-50 text-gray-900 border-gray-300 hover:border-primary focus:ring-primary focus:border-primary'
            }
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${isOpen ? 'ring-2 ring-primary border-primary' : ''}
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary`
          }
          style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
        >
          <span className="block truncate">{getSelectedLabel()}</span>
        </div>
        
        <span 
          className={`pointer-events-none absolute inset-y-0 flex items-center ${
            i18n.language === 'ARABIC' ? 'right-3' : 'left-3'
          }`} 
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          {icon || (
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          )}
        </span>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t('common.search', 'Search...')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
            
            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  {t('common.noOptions', 'No options found')}
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-150
                      ${option.value === value ? 'bg-primary text-white hover:bg-primary-dark' : 'text-gray-900'}
                      ${option.value.startsWith('separator-') ? 'bg-gray-50 text-gray-500 cursor-default hover:bg-gray-50' : ''}
                    `}
                    style={{
                      fontFamily: option.value.startsWith('separator-') ? 'monospace' : 'inherit',
                      fontSize: option.value.startsWith('separator-') ? '0.75rem' : 'inherit',
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className={`mt-1 text-sm text-red-600 ${
          i18n.language === 'ARABIC' ? 'text-right' : 'text-left'
        }`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomSelect; 