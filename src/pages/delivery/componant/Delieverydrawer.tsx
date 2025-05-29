// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryAreaForm from './DelieveryForm';
import { DeliveryArea } from '../../../Types';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface Props {
  open: boolean;
  onClose: () => void;
  area: DeliveryArea | null;
  onSave: (area: DeliveryArea) => void;
}

const DeliveryAreaDrawer: React.FC<Props> = ({ open, onClose, area, onSave }) => {
  const theme = useTheme();
  const isEditMode = area !== null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: { xs: '100%', sm: 450 },
          p: 3,
          background: theme.palette.mode === 'dark' 
            ? '#1e1e1e' 
            : '#f5f5f5',
          borderLeft: '1px solid #e0e0e0',
          // boxShadow: theme.shadows[12],
        } 
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}
      >
           <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocalShippingIcon fontSize="large" />
          {area ? 'Edit Delivery Area' : 'Create New Delivery Area'}
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: '#9e9e9e',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              color: '#1976d2',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DeliveryAreaForm area={area} onSubmit={onSave} onCancel={onClose} />
    </Drawer>
  );
};

export default DeliveryAreaDrawer;