import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomRadioGroupProps {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: 'left' | 'right';
  isRTL?: boolean;
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({ label, name, value, options, onChange, labelAlign = 'left', isRTL }) => {
  return (
    <div className="w-full mb-4">
     {label && (
        <label className={`block mb-1 text-sm font-medium text-gray-900 dark:text-white ${labelAlign === 'right' ? 'text-right' : 'text-left'}`}>{label}</label>
      )}
      <div className={`flex  gap-4`}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={`flex items-center cursor-pointer gap-2 text-primary font-medium`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="accent-primary w-4 h-4 border-2 border-primary focus:ring-primary focus:ring-2 transition-all"
            />
            <span className="text-sm select-none">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CustomRadioGroup; 