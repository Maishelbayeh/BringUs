import React from 'react';
import { Switch } from '@mui/material';

interface CustomSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: 'left' | 'right';
  isRTL?: boolean;
  disabled?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ label, name, checked, onChange, labelAlign = 'left', isRTL, disabled }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        name,
        value: event.target.checked ? 'Y' : 'N'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(newEvent);
  };

  return (
    <div className="w-full mb-4">
      <label className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${isRTL || labelAlign === 'right' ? 'text-right' : 'text-left'}`}>{label}</label>
      <div
        className={`flex items-center  transition-all duration-200
        
          
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