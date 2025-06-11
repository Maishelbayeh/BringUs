// src/components/PaymentMethods/PaymentMethods.tsx
import React, { useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PaymentMethod } from '../../Types';
import PaymentCard from './componant/paymentcard';
import PaymentDrawer from './componant/settingdrawer';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/common/CustomButton';
import useLanguage from '../../hooks/useLanguage';

const initial: PaymentMethod[] = [
  { id: 1, title: 'Cash on Delivery', titleAr: 'الدفع عند الاستلام', titleEn: 'Cash on Delivery', isDefault: true },
  { id: 2, title: 'PayPal', titleAr: 'باي بال', titleEn: 'PayPal', isDefault: false },
  { id: 3, title: 'Visa and Master', titleAr: 'فيزا وماستر', titleEn: 'Visa and Master', isDefault: false },
];

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<PaymentMethod | null>(null);

  // Open drawer for add
  const openDrawer = () => {
    setCurrent(null);
    setDrawerOpen(true);
  };
  // Open drawer for edit
  const openDrawerEdit = (method: PaymentMethod) => {
    setCurrent(method);
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 ,mt:10 }, minHeight: '100vh' }} className='bg-white'>
       <Box
        sx={{
          display: 'flex',
          flexDirection: language === 'ARABIC' ? { xs: 'column', sm: 'row-reverse' } : { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', textAlign: language === 'ARABIC' ? 'right' : 'left' }}
            className='text-primary'
          >
            {t('paymentMethods.title')}
          </Typography>
          <Typography
            variant="body2"
            className='text-body'
            paragraph
            sx={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          >
            {t('paymentMethods.description')}
          </Typography>
        </Box>
        <CustomButton
          color="primary"
          text={ t('paymentMethods.addPaymentMethod')}
          alignment={language === 'ARABIC' ? 'right' : 'left'}
          action={openDrawer}
          icon={<AddIcon />}
          textColor="white"
        />
      </Box>
      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
     
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
        {methods.map(m => (
          <PaymentCard
            key={m.id}
            method={m}
            onClick={() => openDrawerEdit(m)}
            onEdit={() => openDrawerEdit(m)}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            language={language}
          />
        ))}
      </Box>

     

      <PaymentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        method={current}
        onSave={handleSave}
        language={language}
        isEditMode={current !== null}
      />
    </Box>
  );
};

export default PaymentMethods;
