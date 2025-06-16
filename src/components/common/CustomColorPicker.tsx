import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { SketchPicker, ColorResult } from 'react-color';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomButton from './CustomButton';

interface ColorVariant {
  id: string;
  colors: string[];
}

interface CustomColorPickerProps {
  label: string;
  name: string;
  value: ColorVariant[];
  onChange: (e: React.ChangeEvent<{ name: string; value: ColorVariant[] }>) => void;
  isRTL?: boolean;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ label, name, value = [], onChange, isRTL }) => {
  const [currentColors, setCurrentColors] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const handleColorAdd = (color: ColorResult) => {
    const hex = color.hex;
    if (!currentColors.includes(hex)) {
      setCurrentColors([...currentColors, hex]);
    }
  };

  const handleColorRemove = (indexToRemove: number) => {
    setCurrentColors(currentColors.filter((_, index) => index !== indexToRemove));
  };

  const handleVariantAdd = () => {
    if (currentColors.length > 0) {
      const newVariant: ColorVariant = {
        id: Date.now().toString(),
        colors: [...currentColors]
      };
      onChange({ target: { name, value: [...value, newVariant] } } as any);
      setCurrentColors([]);
      setShowPicker(false);
    }
  };

  const handleVariantRemove = (variantId: string) => {
    const newVariants = value.filter(variant => variant.id !== variantId);
    onChange({ target: { name, value: newVariants } } as any);
  };

  const getCircleDivisionStyle = (colors: string[]) => {
    if (colors.length === 1) {
      return { background: colors[0] };
    }

    const step = 100 / colors.length;
    const segments = colors.map((color, index) => {
      const start = step * index;
      const end = step * (index + 1);
      return `${color} ${start}% ${end}%`;
    }).join(', ');

    return {
      background: `conic-gradient(${segments})`
    };
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Typography 
        fontWeight={600} 
        textAlign={isRTL ? 'right' : 'left'} 
        mb={2}
        color="text.secondary"
        variant="subtitle2"
      >
        {label}
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        {!showPicker ? (
          <CustomButton
            icon={<AddIcon sx={{ color: '#634C9F' }} />}
            onClick={() => setShowPicker(true)}
            text={isRTL ? 'إضافة لون جديد' : 'Add New Color'}
            color="primary-light"
            textColor="primary"
            bordercolor="primary"
            style={{ alignSelf: 'flex-start' }}
          />
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box sx={{ 
              '& .sketch-picker': {
                boxShadow: 'none !important',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
              }
            }}>
              <SketchPicker color="#000" onChangeComplete={handleColorAdd} />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              {currentColors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1,
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: color,
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <IconButton
                    className="delete-button"
                    size="small"
                    onClick={() => handleColorRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        backgroundColor: 'white',
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ color: '#634C9F' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Box display="flex" gap={2}>
              <CustomButton
                onClick={handleVariantAdd}
                text={isRTL ? 'إضافة' : 'Add'}
                color="primary"
                textColor="white"
                disabled={currentColors.length === 0}
              />
              <CustomButton
                onClick={() => {
                  setShowPicker(false);
                  setCurrentColors([]);
                }}
                text={isRTL ? 'إلغاء' : 'Cancel'}
                color="primary-light"
                textColor="primary"
                bordercolor="primary"
              />
            </Box>
          </Box>
        )}

        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          {value.map((variant) => (
            <Box
              key={variant.id}
              sx={{
                position: 'relative',
                '&:hover .delete-button': {
                  opacity: 1,
                }
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  ...getCircleDivisionStyle(variant.colors),
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <IconButton
                className="delete-button"
                size="small"
                onClick={() => handleVariantRemove(variant.id)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    backgroundColor: 'white',
                  }
                }}
              >
                <DeleteIcon fontSize="small" sx={{ color: '#634C9F' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default CustomColorPicker;
