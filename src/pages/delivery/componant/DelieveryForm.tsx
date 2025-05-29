// src/components/DeliveryAreas/DeliveryAreaForm.tsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, useTheme, Paper, colors } from '@mui/material';
import { DeliveryArea } from '../../../Types';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Props {
  area: DeliveryArea | null;
  onSubmit: (area: DeliveryArea) => void;
  onCancel: () => void;
}

const DeliveryAreaForm: React.FC<Props> = ({ area, onSubmit, onCancel }) => {
  const theme = useTheme();
  const [location, setLocation] = useState(area?.location || '');
  const [price, setPrice] = useState(area?.price.toString() || '');
  const [whatsappNumber, setWhatsappNumber] = useState(area?.whatsappNumber || '');

  useEffect(() => {
    setLocation(area?.location || '');
    setPrice(area?.price.toString() || '');
    setWhatsappNumber(area?.whatsappNumber || '');
  }, [area]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !price || !whatsappNumber) return;
    onSubmit({
      id: area?.id || Date.now(),
      location,
      price: Number(price),
      whatsappNumber,
    });
  };

  return (
    // <Paper 
    //   elevation={3}
    //   sx={{ 
    //     p: 4,
    //     borderRadius: 4,
    //     background: theme.palette.mode === 'dark' 
    //       ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)' 
    //       : 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
    //     // boxShadow: theme.shadows[10],
    //   }}
    // >
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
        }}
      >
   
        
        <TextField
          label="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <LocationOnIcon sx={{ color: '#bdbdbd', mr: 1 }} />
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#bdbdbd',
              },
              '&:hover fieldset': {
                borderColor: '#64b5f6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
          }}
        />
        
        <TextField
          label="Price (ILS)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          type="number"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <AttachMoneyIcon sx={{ color: '#bdbdbd', mr: 1 }} />
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        
        <TextField
          label="WhatsApp Number"
          helperText="Include country code (e.g., +972501234567)"
          value={whatsappNumber}
          onChange={e => setWhatsappNumber(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <PhoneIphoneIcon sx={{ color: '#bdbdbd', mr: 1 }} />
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2, 
            mt: 4,
            '& .MuiButton-root': {
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
            }
          }}
        >
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{
              borderColor: '#bdbdbd',
              color: '#616161',
              '&:hover': {
                borderColor: '#757575',
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            sx={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              // boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                background: 'linear-gradient(90deg, #64b5f6 0%, #42a5f5 100%)',
                // boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
              }
            }}
          >
            {area ? 'Update Area' : 'Create Area'}
          </Button>
        </Box>
      </Box>
    // </Paper>
  );
};

export default DeliveryAreaForm;