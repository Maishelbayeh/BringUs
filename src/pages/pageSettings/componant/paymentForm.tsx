// src/components/PaymentMethods/componant/PaymentForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography, Button } from '@mui/material';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';

interface Props {
  method: PaymentMethod | null;
  onSubmit: (m: PaymentMethod) => void;
  onCancel: () => void;
}

const AVAILABLE_METHODS = [
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'visa', label: 'Visa and Master' },
];

const PaymentForm: React.FC<Props> = ({ method, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(method?.title || '');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(method?.title || '');
    setFile(null);
  }, [method]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        select
        label={t('Payment Method')}
        value={selected}
        onChange={e => setSelected(e.target.value)}
        SelectProps={{ native: true }}
        fullWidth
      >
        <option value="">{t('Select Payment Method From List')}</option>
        {AVAILABLE_METHODS.map(opt => (
          <option key={opt.id} value={opt.label}>
            {t(opt.label)}
          </option>
        ))}
      </TextField>

      <Box
        sx={{ border: '2px dashed #ccc', borderRadius: 2, py: 6, textAlign: 'center', position: 'relative' }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" hidden onChange={handleFileChange} />
        <Typography variant="body2" color="text.secondary">
          {t('QR Picture')}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          {file ? file.name : t('Choose File')}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {t('Use pictures 500×500 px, 1:1 square, max 300 KB.')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button type="submit" variant="contained" fullWidth disabled={!selected}>
          {t('Save')}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentForm;
