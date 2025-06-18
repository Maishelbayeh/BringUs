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
}) => {
  return (
    <div className={`w-full ${className}`} dir={dir}>
      {label && (
        <label className={`block mb-1 font-semibold text-primary ${labelAlign === 'right' ? 'text-right' : 'text-left'}`}>{label}</label>
      )}
      <textarea
        className={`w-full border rounded px-3 py-2 min-h-[100px] focus:ring-primary focus:border-primary transition ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default CustomTextArea; 