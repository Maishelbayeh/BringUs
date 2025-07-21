import React from 'react';
import useLanguage from '@/hooks/useLanguage';

interface CustomNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  errorColor?: string;
  id?: string;
  labelAlign?: 'left' | 'right' | 'center';
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  label,
  value,
  onChange,
  error,
  errorColor = 'text-red-600',
  id,
  labelAlign = 'left',
  ...props
}) => {
  // const labelAlignClass = labelAlign === 'right' ? 'text-right' : labelAlign === 'center' ? 'text-center' : 'text-left';
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className={`${isRTL ? 'text-right' : 'text-left'} block mb-2 text-sm font-medium text-gray-900 dark:text-white `}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`bg-gray-50 border  text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary ${error ? 'border-red-500' : ''}`}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        {...props}
      />
      {error && (
        <span className={`mt-1 text-xs ${errorColor} block`}>{error}</span>
      )}
    </div>
  );
};

export default CustomNumberInput; 