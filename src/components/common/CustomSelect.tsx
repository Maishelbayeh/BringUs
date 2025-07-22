import React from 'react';
import { useTranslation } from 'react-i18next';

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
  multiple = false
}) => {
  const { i18n, t } = useTranslation();
  const isMultiple = !!multiple;
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
};

export default CustomSelect; 