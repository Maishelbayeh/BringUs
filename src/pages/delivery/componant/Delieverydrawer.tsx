// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryAreaForm from './DelieveryForm';
import { DeliveryArea } from '../../../Types';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  area: DeliveryArea | null;
  onSave: (area: DeliveryArea) => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode: boolean;
}

const DeliveryAreaDrawer: React.FC<Props> = ({ open, onClose, area, onSave, language, isEditMode }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Drawer
      anchor={language === 'ARABIC' ? 'right' : 'left'}
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: { xs: '100%', sm: 450 },
          p: 3,
         
          borderLeft: '1.5px solid #1976d233',
        } 
      }}
    >
      <Box
        className='border-b-2 border-primary'
        sx={{
          display: 'flex',
          flexDirection: language === 'ARABIC' ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          pb: 2,
        }}
      >
        <Typography
          className='text-primary'
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textAlign: language === 'ARABIC' ? 'right' : 'left',
          }}
        >
          <LocalShippingIcon fontSize="large" />
          {isEditMode ? t('deliveryDetails.editDeliveryArea') : t('deliveryDetails.addNewDeliveryArea')}
        </Typography>
        <IconButton
          className='text-primary hover:text-primary'
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DeliveryAreaForm area={area} onSubmit={onSave} onCancel={onClose} language={language} />
    </Drawer>
  );
};

export default DeliveryAreaDrawer;