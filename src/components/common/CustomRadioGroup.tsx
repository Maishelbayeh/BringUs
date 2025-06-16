import React from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';

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
    <FormControl component="fieldset" sx={{ width: '100%' }}>
      <FormLabel component="legend" sx={{ textAlign: isRTL || labelAlign === 'right' ? 'right' : 'left', fontWeight: 600, color: '#634C9F' }}>{label}</FormLabel>
      <RadioGroup
        row
        name={name}
        value={value}
        onChange={onChange}
        sx={{ flexDirection: isRTL || labelAlign === 'right' ? 'row-reverse' : 'row' }}
      >
        {options.map(opt => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={
              <Radio 
                sx={{
                  color: '#ede8f7',
                  '&.Mui-checked': {
                    color: '#634C9F',
                  },
                }}
              />
            }
            label={opt.label}
            labelPlacement={isRTL || labelAlign === 'right' ? 'start' : 'end'}
            sx={{ 
              mx: 1,
              '& .MuiFormControlLabel-label': {
                color: '#634C9F'
              }
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default CustomRadioGroup; 