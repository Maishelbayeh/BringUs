// src/components/PaymentMethods/componant/PaymentDrawer.tsx
import React from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentForm from './paymentForm';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import PaymentIcon from '@mui/icons-material/Payment';
import CustomButton from '@/components/common/CustomButton';

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
      anchor={language === 'ARABIC' ? 'left' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: { xs: '100%', sm: 400 }, 
          borderRadius: 0,
          p: 0,
          display: 'flex',
          flexDirection: 'column'
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

      <div className="flex-1 overflow-y-auto p-6">
        <PaymentForm method={method} onSubmit={onSave} onCancel={onClose} language={language} isEditMode={isEditMode} />
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-end space-x-3">
          <CustomButton
            color="white"
            textColor="primary"
            text={t("paymentMethods.cancel")}
            action={onClose}
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={isEditMode ? t("paymentMethods.edit") : t("paymentMethods.save")}
            action={() => onSave(method!)}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default PaymentDrawer;
