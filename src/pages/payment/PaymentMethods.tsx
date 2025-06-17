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
import { ChevronRightIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';

const initial: PaymentMethod[] = [
  { id: 1, title: 'Cash on Delivery', titleAr: 'الدفع عند الاستلام', titleEn: 'Cash on Delivery', isDefault: true },
  { id: 2, title: 'PayPal', titleAr: 'باي بال', titleEn: 'PayPal', isDefault: false },
  { id: 3, title: 'Visa and Master', titleAr: 'فيزا وماستر', titleEn: 'Visa and Master', isDefault: false },
];

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<PaymentMethod | null>(null);

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null, path: '/' },
    { name: t('paymentMethods.title') || 'Payment Methods', id: 1, path: '/payment-methods' }
  ];

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
      {/* Breadcrumb */}
      <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={item.id}>
            <span className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`} onClick={() => navigate(item.path)}>{item.name}</span>
            {idx < breadcrumb.length - 1 && <ChevronRightIcon className={`h-4 w-4 mx-2 ${language === 'ARABIC' ? 'rotate-180' : ''}`} />}
          </React.Fragment>
        ))}
      </nav>
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
