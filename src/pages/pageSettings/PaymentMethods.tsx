// src/components/PaymentMethods/PaymentMethods.tsx
import React, { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PaymentMethod } from '../../Types';
import PaymentCard from './componant/paymentcard';
import PaymentDrawer from './componant/settingdrawer';
import { useTranslation } from 'react-i18next';

const initial: PaymentMethod[] = [
  { id: 1, title: 'Cash on Delivery', isDefault: true },
  { id: 2, title: 'PayPal', isDefault: false },
  { id: 3, title: 'Visa and Master', isDefault: false },
];

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<PaymentMethod | null>(null);

  const openDrawer = (method?: PaymentMethod) => {
    setCurrent(method ?? null);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(null);
  };

  const handleDelete = (id: number) => {
    setMethods(prev => prev.filter(m => m.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setMethods(prev =>
      prev.map(m => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleSave = (method: PaymentMethod) => {
    setMethods(prev => {
      const exists = prev.some(m => m.id === method.id);
      if (exists) {
        return prev.map(m => (m.id === method.id ? method : m));
      }
      return [...prev, method];
    });
    closeDrawer();
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        {t('Payment Methods')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('Manage your payment methods for seamless transactions')}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {methods.map(m => (
          <PaymentCard
            key={m.id}
            method={m}
            onClick={() => openDrawer(m)}
            onEdit={() => openDrawer(m)}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mt: 3 }}
        onClick={() => openDrawer()}
      >
        {t('Add Payment Method')}
      </Button>

      <PaymentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        method={current}
        onSave={handleSave}
      />
    </Box>
  );
};

export default PaymentMethods;
