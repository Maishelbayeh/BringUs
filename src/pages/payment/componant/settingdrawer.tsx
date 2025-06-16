// src/components/PaymentMethods/componant/PaymentDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentForm from './paymentForm';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import PaymentIcon from '@mui/icons-material/Payment';

interface Props {
  open: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
  onSave: (m: PaymentMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode: boolean;
}

const PaymentDrawer: React.FC<Props> = ({ open, onClose, method, onSave, language, isEditMode }) => {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor={language === 'ARABIC' ? 'right' : 'left'}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, borderRadius: 0, p: 3 } }}
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
         
          {isEditMode ? t('paymentMethods.editPaymentMethod') : t('paymentMethods.addPaymentMethod')}
          <PaymentIcon fontSize="large" />
        </Typography>
        <IconButton
          className='text-primary hover:text-primary'
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <PaymentForm method={method} onSubmit={onSave} onCancel={onClose} language={language} isEditMode={isEditMode} />
    </Drawer>
  );
};

export default PaymentDrawer;
