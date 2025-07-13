import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  id?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  id, 
  icon, 
  className = '', 
  disabled, 
  error,
  placeholder
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const handleOptionClick = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const getSelectedLabels = () => {
    return selectedValues.map(val => {
      const option = options.find(opt => opt.value === val);
      return option ? option.label : val;
    });
  };

  const selectedLabels = getSelectedLabels();

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
      <div className="relative" ref={dropdownRef}>
        <div
          className={`appearance-none border text-sm rounded-lg block w-full py-2.5 pr-10 pl-10 transition-all duration-200 cursor-pointer
            ${disabled 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary hover:border-primary'
            }
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary`
          }
          style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 min-h-[20px] items-center">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary text-white rounded-md"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(selectedValues[index], e)}
                    className="ml-1 text-white hover:text-red-200 focus:outline-none"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">
                {placeholder || t('common.selectOptions', 'Select options')}
              </span>
            )}
          </div>
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

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${
                  selectedValues.includes(option.value) ? 'bg-primary text-white' : ''
                }`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
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

export default MultiSelect;
