import React from 'react';

interface CustomTextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  labelAlign?: 'left' | 'right';
  dir?: 'rtl' | 'ltr';
  rows?: number;
  className?: string;
  disabled?: boolean;
  name?: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  labelAlign = 'left',
  dir,
  rows = 4,
  className = '',
  disabled = false,
  name,
}) => {
  return (
    <div className={`w-full mb-4 ${className}`} dir={dir}>
      {label && (
        <label className={`block mb-1 text-sm font-medium text-gray-900 dark:text-white ${labelAlign === 'right' ? 'text-right' : 'text-left'}`}>{label}</label>
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