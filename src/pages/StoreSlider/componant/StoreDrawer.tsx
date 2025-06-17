// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StoreSliderForm from './StoreSliderForm';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';

interface StoreSliderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
  mode?: 'slider' | 'video';
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
}

const StoreSliderDrawer: React.FC<StoreSliderDrawerProps> = ({ open, onClose, onSave, form, onFormChange, onImageChange, isRTL, mode = 'slider', categories = [], subcategories = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Drawer
      anchor={isRTL ? 'left' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: { xs: '100%', sm: 450 },
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1.5px solid #1976d233',
          height: '100vh',
        } 
      }}
    >
      <Box
        className='border-b-2 border-primary'
        sx={{
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
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
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {t('sideBar.storeSlider')}
        </Typography>
        <IconButton
          className='text-primary hover:text-primary'
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <form 
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6"
      >
        <StoreSliderForm 
          form={form}
          onFormChange={onFormChange}
          onImageChange={onImageChange}
          isRTL={isRTL}
          mode={mode}
        />
      </form>
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-end space-x-3">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel')}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save')}
            type="submit"
            form="store-slider-form"
          />
        </div>
      </div>
    </Drawer>
  );
};

export default StoreSliderDrawer;