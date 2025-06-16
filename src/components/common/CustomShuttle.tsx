import React, { useState } from 'react';
import { Box, List, ListItemText, Typography, IconButton, ListItemButton, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIos';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';


interface Option {
  value: string;
  label: string;
}

interface CustomShuttleProps {
  label: string;
  name: string;
  value: string[];
  options: Option[];
  onChange: (e: React.ChangeEvent<{ name: string; value: string[] }>) => void;
  isRTL?: boolean;
}

const CustomShuttle: React.FC<CustomShuttleProps> = ({ label, name, value, options, onChange, isRTL }) => {
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);

  const leftOptions = options.filter(opt => !value.includes(opt.value));
  const rightOptions = options.filter(opt => value.includes(opt.value));

  const handleMoveRight = () => {
    const newValue = [...value, ...selectedLeft];
    onChange({ target: { name, value: newValue } } as any);
    setSelectedLeft([]);
  };

  const handleMoveLeft = () => {
    const newValue = value.filter(v => !selectedRight.includes(v));
    onChange({ target: { name, value: newValue } } as any);
    setSelectedRight([]);
  };

  const handleMoveAllRight = () => {
    const newValue = [...value, ...leftOptions.map(opt => opt.value)];
    onChange({ target: { name, value: newValue } } as any);
    setSelectedLeft([]);
  };

  const handleMoveAllLeft = () => {
    onChange({ target: { name, value: [] } } as any);
    setSelectedRight([]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography fontWeight={600} textAlign={isRTL ? 'right' : 'left'} mb={1}>{label}</Typography>
      <Box display="flex" flexDirection={isRTL ? 'row-reverse' : 'row'} gap={2}>
        <List 
          sx={{ 
            width: '45%', 
            border: '1px solid #eee', 
            borderRadius: 2, 
            height: 300,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
        >
          {leftOptions.map(opt => (
            <ListItemButton
              key={opt.value}
              selected={selectedLeft.includes(opt.value)}
              onClick={() => setSelectedLeft(sel => sel.includes(opt.value) ? sel.filter(v => v !== opt.value) : [...sel, opt.value])}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#ede8f7',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 76, 159, 0.12)',
                  },
                },
              }}
            >
              <ListItemText primary={opt.label} />
            </ListItemButton>
          ))}
        </List>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveAllRight}
            disabled={leftOptions.length === 0}
            sx={{
              minWidth: 'auto',
              px: 1,
              backgroundColor: '#ede8f7',
              '&:hover': {
                backgroundColor: 'rgba(99, 76, 159, 0.12)',
              },
            }}
          >
            {isRTL ? <DoubleArrowIcon sx={{ transform: 'rotate(180deg)', color: '#634C9F' }} /> : <DoubleArrowIcon sx={{ color: '#634C9F' }} />}
          </Button>
          <IconButton 
            onClick={handleMoveRight} 
            disabled={selectedLeft.length === 0}
            sx={{
              backgroundColor: '#ede8f7',
              '&:hover': {
                backgroundColor: 'rgba(99, 76, 159, 0.12)',
              },
            }}
          >
            {isRTL ? <ArrowBackIcon sx={{ color: '#634C9F' }} /> : <ArrowForwardIcon sx={{ color: '#634C9F' }} />}
          </IconButton>
          <IconButton 
            onClick={handleMoveLeft} 
            disabled={selectedRight.length === 0}
            sx={{
              backgroundColor: '#ede8f7',
              '&:hover': {
                backgroundColor: 'rgba(99, 76, 159, 0.12)',
              },
            }}
          >
            {isRTL ? <ArrowForwardIcon sx={{ color: '#634C9F' }} /> : <ArrowBackIcon sx={{ color: '#634C9F' }} />}
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMoveAllLeft}
            disabled={rightOptions.length === 0}
            sx={{
              minWidth: 'auto',
              px: 1,
              backgroundColor: '#ede8f7',
              '&:hover': {
                backgroundColor: 'rgba(99, 76, 159, 0.12)',
              },
            }}
          >
            {isRTL ? <DoubleArrowIcon sx={{ color: '#634C9F' }} /> : <DoubleArrowIcon sx={{ transform: 'rotate(180deg)', color: '#634C9F' }} />}
          </Button>
        </Box>
        <List 
          sx={{ 
            width: '45%', 
            border: '1px solid #eee', 
            borderRadius: 2, 
            height: 300,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}
        >
          {rightOptions.map(opt => (
            <ListItemButton
              key={opt.value}
              selected={selectedRight.includes(opt.value)}
              onClick={() => setSelectedRight(sel => sel.includes(opt.value) ? sel.filter(v => v !== opt.value) : [...sel, opt.value])}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#ede8f7',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 76, 159, 0.12)',
                  },
                },
              }}
            >
              <ListItemText primary={opt.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default CustomShuttle; 