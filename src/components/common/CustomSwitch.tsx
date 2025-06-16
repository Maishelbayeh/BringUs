import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';

interface CustomSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: 'left' | 'right';
  isRTL?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ label, name, checked, onChange, labelAlign = 'left', isRTL }) => {
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
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={handleChange}
          name={name}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
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
      }
      label={label}
      labelPlacement={isRTL || labelAlign === 'right' ? 'start' : 'end'}
      sx={{
        flexDirection: isRTL || labelAlign === 'right' ? 'row-reverse' : 'row',
        justifyContent: isRTL || labelAlign === 'right' ? 'flex-end' : 'flex-start',
        width: '100%',
        margin: 0,
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
          color: 'text.secondary' 
        }
      }}
    />
  );
};

export default CustomSwitch; 