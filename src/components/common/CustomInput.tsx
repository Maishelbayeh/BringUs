import React from 'react';
import { useTranslation } from 'react-i18next';
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  errorColor?: string;
  id?: string;
  type?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, error, errorColor = 'text-red-600', id, type = 'text', options, className = '', ...props }) => {
  const { i18n } = useTranslation();
  
  // Debug logging
  if (error) {
    console.log('🚨 CustomInput error for', label, ':', error);
  }
  
  // const labelAlignClass = labelAlign === 'right' ? 'text-right' : labelAlign === 'center' ? 'text-center' : 'text-left';
  return (
    <div className="w-full">
      <label htmlFor={id} className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white `}
      style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
      >
        {label}
        {props.required && <span className={`${i18n.language === 'ARABIC' ? 'mr-1' : 'ml-1'} text-red-500`}>*</span>}
      </label>
      {type === 'select' && options ? (
        <div className="relative">
          <select
            id={id}
            className={`appearance-none bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
            style={{ direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr' }}
            {...(props as any)}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} style={{ padding: '8px 16px 16px 16px' }}>{opt.label}</option>
            ))}
          </select>
          <span className={`pointer-events-none absolute inset-y-0 flex items-center ${i18n.language === 'ARABIC' ? 'right-3' : 'left-3'}`}>
                <svg
              className={`w-4 h-4 text-gray-400 ${i18n.language === 'ARABIC' ? '-rotate-90' : 'rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      ) : (
        <input
          id={id}
          type={type}
          autoComplete="off"
          className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
              ${props.disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-900  focus:ring-primary focus:border-primary'}
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary
              ${error ? 'border-red-500' : ''} ${className}`}
          style={{ 
            direction: i18n.language === 'ARABIC' ? 'rtl' : 'ltr',
           
          }}
          {...props}
        />
      )}
      {error && (
        <span className="mt-1 text-xs text-red-600 block">{error}</span>
      )}
    </div>
  );
};

export default CustomInput; 