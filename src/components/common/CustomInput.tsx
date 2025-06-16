import React from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  errorColor?: string;
  id?: string;
  labelAlign?: 'left' | 'right' | 'center';
  type?: string;
  options?: { value: string; label: string }[];
}

const CustomInput: React.FC<CustomInputProps> = ({ label, error, errorColor = 'text-red-600', id, labelAlign = 'left', type = 'text', options, ...props }) => {
  const labelAlignClass = labelAlign === 'right' ? 'text-right' : labelAlign === 'center' ? 'text-center' : 'text-left';
  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${labelAlignClass}`}>
        {label}
      </label>
      {type === 'select' && options ? (
        <div className="relative">
          <select
            id={id}
            className={`appearance-none bg-gray-50 border border-primary text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary ${error ? 'border-red-500' : ''}`}
            style={{ direction: labelAlign === 'right' ? 'rtl' : 'ltr' }}
            {...(props as any)}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} style={{ padding: '8px 16px 16px 16px' }}>{opt.label}</option>
            ))}
          </select>
          <span className={`pointer-events-none absolute inset-y-0 flex items-center ${labelAlign === 'right' ? 'left-3' : 'right-3'}`} style={{ top: '50%', transform: 'translateY(-50%)' }}>
            <svg
              className={`w-4 h-4 text-gray-400 ${labelAlign === 'right' ? 'rotate-90' : '-rotate-90'}`}
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
          className={`bg-gray-50 border border-primary text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary ${error ? 'border-red-500' : ''}`}
          {...props}
        />
      )}
      {error && (
        <span className={`mt-1 text-xs ${errorColor} block`}>{error}</span>
      )}
    </div>
  );
};

export default CustomInput; 