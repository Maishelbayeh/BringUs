import React from 'react';
import { Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: 'left' | 'right';
 
  disabled?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ label, name, checked, onChange, disabled }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // إنشاء event جديد مع القيم المحدثة
    const syntheticEvent = {
      ...event,
      target: {
        ...event.target,
        checked: event.target.checked
      }
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar' || i18n.language === 'ar-EG' || i18n.language === 'ARABIC';
  return (
    <div className="w-full mb-4">
      <label className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{label}</label>
      <div
        className={`${isRTL ? 'rotate-180 flex-row-reverse' : ''}
          flex items-center  transition-all duration-200
        
          
        `}
        tabIndex={-1}
      >
        <Switch
          checked={checked}
          onChange={handleChange}
          name={name}
          
          disabled={disabled}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              direction: 'rtl',
              color: '#634C9F',
              '& + .MuiSwitch-track': {
                backgroundColor: '#634C9F',
                opacity: 0.5,
              },
            },
            '& .MuiSwitch-track': {
              backgroundColor: '#ede8f7',
            },
          }}
        />
      </div>
    </div>
  );
};

export default CustomSwitch; 