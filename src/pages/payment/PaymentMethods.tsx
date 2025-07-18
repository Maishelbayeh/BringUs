// src/components/PaymentMethods/PaymentMethods.tsx
import React, { useState } from 'react';
import { PaymentMethod } from '../../Types';
import PaymentCard from './componant/paymentcard';
import PaymentDrawer from './componant/settingdrawer';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { PlusIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const initial: PaymentMethod[] = [
  { 
    id: 1, 
    title: 'Cash on Delivery', 
    titleAr: 'الدفع عند الاستلام', 
    titleEn: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    descriptionAr: 'ادفع عند استلام طلبك',
    descriptionEn: 'Pay when you receive your order',
    methodType: 'cash',
    isDefault: true, 
    isActive: true,
    processingFee: 0,
    minimumAmount: 0,
    maximumAmount: 10000,
    supportedCurrencies: ['ILS'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 2, 
    title: 'PayPal', 
    titleAr: 'باي بال', 
    titleEn: 'PayPal',
    description: 'Secure online payment with PayPal',
    descriptionAr: 'دفع آمن عبر الإنترنت مع باي بال',
    descriptionEn: 'Secure online payment with PayPal',
    methodType: 'digital_wallet',
    isDefault: false, 
    isActive: true,
    processingFee: 2.9,
    minimumAmount: 5,
    maximumAmount: 5000,
    supportedCurrencies: ['ILS', 'USD', 'EUR'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: 3, 
    title: 'Visa and Mastercard', 
    titleAr: 'فيزا وماستركارد', 
    titleEn: 'Visa and Mastercard',
    description: 'Credit and debit card payments',
    descriptionAr: 'مدفوعات البطاقات الائتمانية والمدى',
    descriptionEn: 'Credit and debit card payments',
    methodType: 'card',
    isDefault: false, 
    isActive: true,
    processingFee: 3.5,
    minimumAmount: 10,
    maximumAmount: 15000,
    supportedCurrencies: ['ILS', 'USD', 'EUR', 'GBP'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
];

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<PaymentMethod | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; method: PaymentMethod | null }>({
    isOpen: false,
    method: null
  });

  // Statistics
  const totalMethods = methods.length;
  const activeMethods = methods.filter(m => m.isActive).length;
  const defaultMethod = methods.find(m => m.isDefault);

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
    const methodToDelete = methods.find(m => m.id === id);
    if (methodToDelete) {
      setDeleteModal({ isOpen: true, method: methodToDelete });
    }
  };

  const confirmDelete = () => {
    if (deleteModal.method) {
      setMethods(prev => prev.filter(m => m.id !== deleteModal.method!.id));
      setDeleteModal({ isOpen: false, method: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, method: null });
  };

  const handleSetDefault = (id: number) => {
    setMethods(prev =>
      prev.map(m => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleToggleActive = (id: number) => {
    setMethods(prev =>
      prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m)
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
    <div className='bg-white sm:p-4'>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('paymentMethods.totalPaymentMethods')}</p>
              <p className="text-2xl font-bold">{totalMethods}</p>
            </div>
            <CreditCardIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('paymentMethods.activePaymentMethods')}</p>
              <p className="text-2xl font-bold">{activeMethods}</p>
            </div>
            <BanknotesIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('paymentMethods.defaultPaymentMethod')}</p>
              <p className="text-lg font-bold truncate">
                {defaultMethod ? (language === 'ARABIC' ? defaultMethod.titleAr : defaultMethod.titleEn) : t('common.none')}
              </p>
            </div>
            <PlusIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Payment Methods Grid */}
      {methods.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {methods.map(method => (
            <PaymentCard
              key={method.id}
              method={method}
              onClick={() => openDrawerEdit(method)}
              onEdit={openDrawerEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              onToggleActive={handleToggleActive}
              language={language}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCardIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('paymentMethods.noPaymentMethods')}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('paymentMethods.noPaymentMethodsDescription')}
          </p>
          <button
            onClick={openDrawer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {t('paymentMethods.addPaymentMethod')}
          </button>
        </div>
      )}

      <PaymentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        method={current}
        onSave={handleSave}
        language={language}
        isEditMode={current !== null}
      />

      {/* Permission Modal for Delete */}
      <PermissionModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t('paymentMethods.deleteConfirmTitle')}
        message={t('paymentMethods.deleteConfirmMessage')}
        itemName={deleteModal.method ? (language === 'ARABIC' ? deleteModal.method.titleAr : deleteModal.method.titleEn) : ''}
        itemType={t('paymentMethods.paymentMethod')}
        requirePermission={true}
        confirmButtonText={t('paymentMethods.delete')}
        cancelButtonText={t('paymentMethods.cancel')}
        isRTL={language === 'ARABIC'}
        severity="danger"
      />
    </div>
  );
};

export default PaymentMethods;
