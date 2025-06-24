// src/components/PaymentMethods/PaymentMethods.tsx
import React, { useState } from 'react';
import { PaymentMethod } from '../../Types';
import PaymentCard from './componant/paymentcard';
import PaymentDrawer from './componant/settingdrawer';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';

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
    <div className='bg-white p-4'>
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('paymentMethods.title') || 'Payment Methods', href: '/payment-methods' }
      ]} isRtl={language === 'ARABIC'} /> 
      <HeaderWithAction
        title={t('paymentMethods.title')}
        addLabel={t('paymentMethods.addPaymentMethod')}
        onAdd={openDrawer}
        isRtl={language === 'ARABIC'} 
        count={methods.length}
      />
      {/* <Typography
        variant="body2"
        className='text-body'
        paragraph
        sx={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
      >
        {t('paymentMethods.description')}
      </Typography> */}
     
     
      <div className='flex flex-wrap gap-2'>
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
      </div>

     

      <PaymentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        method={current}
        onSave={handleSave}
        language={language}
        isEditMode={current !== null}
      />
    </div>
  );
};

export default PaymentMethods;
