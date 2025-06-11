// src/components/PaymentMethods/componant/PaymentDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentForm from './paymentForm';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {isEditMode ? t('paymentMethods.editPaymentMethod') : t('paymentMethods.addPaymentMethod')}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <PaymentForm method={method} onSubmit={onSave} onCancel={onClose} language={language} />
    </Drawer>
  );
};

export default PaymentDrawer;
