// src/components/PaymentMethods/PaymentMethods.tsx
import React, { useState } from 'react';
import { PaymentMethod } from '../../Types';
import PaymentCard from './componant/paymentcard';
import PaymentDrawer from './componant/settingdrawer';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { PlusIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<PaymentMethod | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; method: PaymentMethod | null }>({
    isOpen: false,
    method: null
  });

  // Use the payment methods hook
  const {
    paymentMethods,
    loading,
    error,
    createPaymentMethodWithFiles,
    updatePaymentMethodWithFiles,
    deletePaymentMethod,
    toggleActiveStatus,
    setAsDefault,
  } = usePaymentMethods();

  // Statistics
  const totalMethods = paymentMethods.length;
  const activeMethods = paymentMethods.filter(m => m.isActive).length;
  const defaultMethod = paymentMethods.find(m => m.isDefault);

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

  const handleDelete = (id: string) => {
    const methodToDelete = paymentMethods.find(m => (m._id || m.id?.toString()) === id);
    if (methodToDelete) {
      setDeleteModal({ isOpen: true, method: methodToDelete });
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.method) {
      const methodId = deleteModal.method._id || deleteModal.method.id?.toString();
      if (methodId) {
        const success = await deletePaymentMethod(methodId);
        if (success) {
          setDeleteModal({ isOpen: false, method: null });
        }
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, method: null });
  };

  const handleSetDefault = async (id: string) => {
    await setAsDefault(id);
  };

  const handleToggleActive = async (id: string) => {
    await toggleActiveStatus(id);
  };

  const handleSave = async (method: PaymentMethod & {
    logoFile?: File | null;
    qrCodeFile?: File | null;
    paymentImageFiles?: Array<{
      file: File;
      imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other';
      altText: string;
    }>;
  }) => {
    try {
      if (current) {
        // Update existing method with files
        const methodId = current._id || current.id?.toString();
        if (methodId) {
          const result = await updatePaymentMethodWithFiles(methodId, {
            titleAr: method.titleAr,
            titleEn: method.titleEn,
            descriptionAr: method.descriptionAr,
            descriptionEn: method.descriptionEn,
            methodType: method.methodType,
            isActive: method.isActive,
            isDefault: method.isDefault,
            logoUrl: method.logoUrl,
            qrCode: method.qrCode,
            paymentImages: method.paymentImages,
            // Add file data from form
            logoFile: method.logoFile,
            qrCodeFile: method.qrCodeFile,
            paymentImageFiles: method.paymentImageFiles,
          });
          
          if (result) {
            closeDrawer();
          }
        }
      } else {
        // Create new method with files
        const result = await createPaymentMethodWithFiles({
          titleAr: method.titleAr,
          titleEn: method.titleEn,
          descriptionAr: method.descriptionAr,
          descriptionEn: method.descriptionEn,
          methodType: method.methodType,
          isActive: method.isActive,
          isDefault: method.isDefault,
          logoUrl: method.logoUrl,
          qrCode: method.qrCode,
          paymentImages: method.paymentImages,
          // Add file data from form
          logoFile: method.logoFile,
          qrCodeFile: method.qrCodeFile,
          paymentImageFiles: method.paymentImageFiles,
        });
        
        if (result) {
          closeDrawer();
        }
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <CreditCardIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('general.error')}
        </h3>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {t('general.retry')}
        </button>
      </div>
    );
  }

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
        count={paymentMethods.length}
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
      {paymentMethods.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {paymentMethods.map(method => (
            <PaymentCard
              key={method._id || method.id}
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
