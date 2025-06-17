import React from 'react';
import { useTranslation } from 'react-i18next';
interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  id?: string;
  icon?: React.ReactNode;
  className?: string;
  
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, id, icon, className = '' }) => {
  const { i18n } = useTranslation()
  return (
    <div className={`w-full ${className}`}>
    
        {label && <label htmlFor={id} className={`block mb-1 text-sm font-medium text-gray-900 dark:text-white ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
        {label}
      </label>}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`appearance-none bg-gray-50 border border-primary text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full py-2.5 pr-10 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary transition-all duration-200`}
          style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className={`pointer-events-none absolute inset-y-0 flex items-center ${i18n.language === 'ARABIC' ? 'right-3' : 'left-3'}`} style={{ top: '50%', transform: 'translateY(-50%)' }}>
          {icon || (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
};

export default CustomSelect; 