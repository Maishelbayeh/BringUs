// src/components/PaymentMethods/componant/PaymentForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomSelect from '../../../components/common/CustomSelect';

interface Props {
  method: PaymentMethod | null;
  onSubmit: (m: PaymentMethod) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode?: boolean;
}

const PaymentForm: React.FC<Props> = ({ method, onSubmit, onCancel, language, isEditMode }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(method?.title || '');
  const [file, setFile] = useState<File | null>(null);
  const isRTL = language === 'ARABIC';

  const AVAILABLE_METHODS = [
    { value: 'Cash on Delivery', label: t('Cash on Delivery') },
    { value: 'PayPal', label: t('PayPal') },
    { value: 'Visa and Master', label: t('Visa and Master') },
  ];

  useEffect(() => {
    setSelected(method?.title || '');
    setFile(null);
  }, [method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const logoUrl = file ? URL.createObjectURL(file) : method?.logoUrl;
    const newMethod: PaymentMethod = {
      id: method?.id || Date.now(),
      title: selected,
      logoUrl,
      isDefault: method?.isDefault || false,
    };
    onSubmit(newMethod);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 3,
        borderRadius: 3,
      }}
    >
      <CustomSelect
        label={t('paymentMethods.paymentMethod')}
        value={selected}
        onChange={e => setSelected(e.target.value)}
        options={AVAILABLE_METHODS}
        isRTL={isRTL}
      />
      <CustomFileInput
            label={t('paymentMethods.qrPicture')}
        id="qr_picture"
        value={file ? file.name : ''}
        onChange={setFile}
        placeholder={t('paymentMethods.chooseFile')}
        labelAlign={isRTL ? 'right' : 'left'}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
      />
     
      <Box
        sx={{
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'flex-start',
          gap: 2,
          mt: 4,
        }}
      >
        <CustomButton
          color="primary"
          textColor="white"
          text={isEditMode ? t('paymentMethods.edit') : t('paymentMethods.save')}
          type="submit"
        />
        <CustomButton
          color="white"
          textColor="primary"
          text={t('paymentMethods.cancel')}
          action={onCancel}
        />
      </Box>
    </Box>
  );
};

export default PaymentForm;
