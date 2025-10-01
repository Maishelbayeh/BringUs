import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Typography, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, ColorLens as ColorLensIcon } from '@mui/icons-material';
import { ChromePicker, ColorResult } from 'react-color';
import useProducts from '../../hooks/useProducts';

interface ColorManagerProps {
  productId: string;
  currentColors?: string[][];
  onColorsChange?: (colors: string[][]) => void;
  readOnly?: boolean;
}

const ColorManager: React.FC<ColorManagerProps> = ({
  productId,
  currentColors = [],
  onColorsChange,
  readOnly = false
}) => {
  const [colors, setColors] = useState<string[][]>(currentColors);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newColorGroup, setNewColorGroup] = useState<string[]>(['#000000']);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [colorInput, setColorInput] = useState<string>('#000000');
  const [error, setError] = useState<string>('');

  const {
    addColorsToProduct,
    removeColorsFromProduct,
    replaceProductColors,

  } = useProducts();

  useEffect(() => {
    setColors(currentColors);
  }, [currentColors]);

  const validateColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
    
    return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color);
  };

  const handleAddColor = () => {
    if (!validateColor(colorInput)) {
      setError('يرجى إدخال لون صحيح (مثل: #FF0000 أو rgb(255,0,0))');
      return;
    }
    
    if (!newColorGroup.includes(colorInput)) {
      setNewColorGroup([...newColorGroup, colorInput]);
    }
    setColorInput('#000000');
    setError('');
  };

  const handleRemoveColor = (index: number) => {
    setNewColorGroup(newColorGroup.filter((_, i) => i !== index));
  };

  const handleSaveColors = async () => {
    if (newColorGroup.length === 0) {
      setError('يجب إضافة لون واحد على الأقل');
      return;
    }

    try {
      if (editingIndex >= 0) {
        // تحديث مجموعة ألوان موجودة
        const updatedColors = [...colors];
        updatedColors[editingIndex] = [...newColorGroup];
        await replaceProductColors(productId, updatedColors);
        setColors(updatedColors);
        onColorsChange?.(updatedColors);
      } else {
        // إضافة مجموعة ألوان جديدة
        const newColors = [...colors, [...newColorGroup]];
        await addColorsToProduct(productId, [newColorGroup]);
        setColors(newColors);
        onColorsChange?.(newColors);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving colors:', error);
    }
  };

  const handleDeleteColorGroup = async (index: number) => {
    try {
      await removeColorsFromProduct(productId, [index]);
      const updatedColors = colors.filter((_, i) => i !== index);
      setColors(updatedColors);
      onColorsChange?.(updatedColors);
    } catch (error) {
      console.error('Error deleting color group:', error);
    }
  };

  const handleEditColorGroup = (index: number) => {
    setEditingIndex(index);
    setNewColorGroup([...colors[index]]);
    setOpenEditDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setEditingIndex(-1);
    setNewColorGroup(['#000000']);
    setColorInput('#000000');
    setError('');
  };

  const handleColorChange = (color: ColorResult) => {
    setSelectedColor(color.hex);
    setColorInput(color.hex);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <ColorLensIcon />
          ألوان المنتج
        </Typography>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            size="small"
          >
            إضافة ألوان
          </Button>
        )}
      </Box>

      {colors.length === 0 ? (
        <Alert severity="info">لا توجد ألوان مضافة لهذا المنتج</Alert>
      ) : (
        <Grid container spacing={2}>
          {colors.map((colorGroup, groupIndex) => (
              <Box
                border={1}
                borderColor="divider"
                borderRadius={1}
                p={2}
                position="relative"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    مجموعة {groupIndex + 1}
                  </Typography>
                  {!readOnly && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditColorGroup(groupIndex)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteColorGroup(groupIndex)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {colorGroup.map((color, colorIndex) => (
                    <Chip
                      key={colorIndex}
                      label={color}
                      style={{
                        backgroundColor: color,
                        color: color.startsWith('#') ? 
                          (parseInt(color.slice(1), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000'
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
          ))}
        </Grid>
      )}

      {/* Dialog for adding/editing colors */}
      <Dialog open={openAddDialog || openEditDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'تعديل مجموعة الألوان' : 'إضافة مجموعة ألوان جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" mb={1}>
              اختر لون جديد:
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <ChromePicker
                color={selectedColor}
                onChange={handleColorChange}
                disableAlpha
              />
              <Box>
                <TextField
                  label="كود اللون"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  size="small"
                  error={!!error}
                  helperText={error}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddColor}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  إضافة اللون
                </Button>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" mb={1}>
              الألوان المضافة:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {newColorGroup.map((color, index) => (
                <Chip
                  key={index}
                  label={color}
                  onDelete={() => handleRemoveColor(index)}
                  style={{
                    backgroundColor: color,
                    color: color.startsWith('#') ? 
                      (parseInt(color.slice(1), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000'
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveColors} variant="contained">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ColorManager; 