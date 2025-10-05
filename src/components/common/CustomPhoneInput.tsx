import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useTranslation } from 'react-i18next';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
 
  required?: boolean;
  label?: string;
  error?: string;
}

const CustomPhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,

  required,
  label,
  error,
}) => {
  const handleChange = (phone: string, country: any) => {
    onChange(phone);
console.log('country',country);
   
  };

  const { i18n } = useTranslation();

  return (
    <div>
      {label && (
        <label className="block mb-2 text-sm font-medium" dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}>
          {label} {required && <span className={`${i18n.language === 'ARABIC' ? 'mr-1' : 'ml-1'} text-red-500`}>*</span>}
        </label>
      )}
      <PhoneInput
      
        country={'ps'} // 🇵🇸 كود افتراضي
        value={value}
        onChange={handleChange}
        inputStyle={{
          width: '100%',
          borderRadius: '0.5rem',
          padding: '12px',
          paddingLeft: '46px',
          height: '46px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          lineHeight: '1.25rem',

        }}
        inputClass={`
          appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary
          ${error ? 'border-red-500' : ''} 
        `}
        buttonClass="rounded-l-lg border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
        enableSearch={true} 
        disableDropdown={false} // يخلي select مفتوح
      />
      {error && (
        <span className="mt-1 text-xs text-red-600 block">{error}</span>
      )}
    </div>
  );
};

export default CustomPhoneInput;
