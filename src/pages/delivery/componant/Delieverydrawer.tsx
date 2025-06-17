// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryAreaForm from './DelieveryForm';
import { DeliveryArea } from '../../../Types';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';

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
          p: 0,
          display: 'flex',
          flexDirection: 'column',
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
          p: 3,
          pb: 2,
        }}
      >
        <Typography
          className='text-primary'
          variant="h5"
          sx={{
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

      <form 
        id="delivery-area-form" 
        onSubmit={(e) => { e.preventDefault(); if (area) onSave(area); }} 
        className="flex-1 overflow-y-auto p-6"
      >
        <DeliveryAreaForm area={area} onSubmit={onSave} onCancel={onClose} language={language} />
      </form>

      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-end space-x-3">
        <CustomButton
            color="primary"
            textColor="white"
            text={area ? t("deliveryDetails.updateArea") : t("deliveryDetails.createArea")}
            action={() => {}}
            type="submit"
          />
           <CustomButton
            color="white"
            textColor="primary"
            text={t("deliveryDetails.cancel")}
            action={onClose}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default DeliveryAreaDrawer;