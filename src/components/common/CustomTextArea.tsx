import React from 'react';
import { useTranslation } from 'react-i18next';

interface CustomTextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  dir?: 'rtl' | 'ltr';
  rows?: number;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  dir,
  required = false,
  rows = 4,
  className = '',
  disabled = false,
  name,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  return (
    <div className={`w-full mb-4 ${className}`} dir={dir}>
      {label && (
        <label className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${currentLanguage === 'ARABIC' ? 'text-right' : 'text-left'}`}>{label} {required && <span className="text-red-500">*</span>}</label>
      )}
      <textarea
        className={`appearance-none bg-gray-50 border  text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary transition-all duration-200 ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        name={name}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default CustomTextArea; 