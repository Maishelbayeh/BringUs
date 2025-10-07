// src/components/PaymentMethods/DeliveryMethods.tsx
import React, { useState, useEffect } from 'react';
import { DelieveryMethod } from '../../Types';
import DlieveryCard from './componant/DlieveryCard';
import Delieverydrawer from './componant/Delieverydrawer';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';   
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import useDeliveryMethods from '../../hooks/useDeliveryMethods';
import { useToastContext } from '../../contexts/ToastContext';
import { getStoreId } from '../../utils/storeUtils';

const DeliveryMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { showError,showWarning } = useToastContext();
  
  // Use the delivery methods hook with dynamic store ID
  const {
    deliveryMethods: areas,
    loading,
    error,  
    isRateLimited,
    rateLimitResetTime,
    fetchDeliveryMethods,
    createDeliveryMethod,
    updateDeliveryMethod,
    deleteDeliveryMethod,
    toggleActiveStatus,
    setAsDefault,
    clearError,
    clearRateLimit
  } = useDeliveryMethods({
    storeId: getStoreId()
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<DelieveryMethod | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; area: DelieveryMethod | null }>({
    isOpen: false,
    area: null
  });
  
  const isEditMode = current !== null;

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      if (error.includes('Rate limit exceeded') || error.includes('Rate limited')) {
        showWarning(
          'Too many requests. Please wait a moment and try again.',
          'Rate Limited'
        );
      } else {
        showError(error, 'Error');
      }
      clearError();
    }
  }, [error, showError, showWarning, clearError]);

  // Format time remaining
  const getTimeRemaining = () => {
    if (!rateLimitResetTime) return null;
    const now = new Date();
    const timeUntilReset = rateLimitResetTime.getTime() - now.getTime();
    if (timeUntilReset <= 0) return null;
    
    const minutes = Math.floor(timeUntilReset / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    clearRateLimit();
    fetchDeliveryMethods();
  };

  //-------------------------------------------- openDrawer -------------------------------------------
  const openDrawer = () => {
    setCurrent(null);
    setDrawerOpen(true);
  };

  // Open drawer for edit
  const openDrawerEdit = (area: DelieveryMethod) => {
    setCurrent(area);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(null);
  };

  const handleSave = async (area: DelieveryMethod) => {
    try {
      let result;
      if (isEditMode && current?._id) {
        // Update existing delivery method
        result = await updateDeliveryMethod(current._id, area);
      } else {
        // Create new delivery method
        result = await createDeliveryMethod(area);
      }
      
      // Only close drawer if the API call was successful
      if (result !== null && result !== false) {
        closeDrawer();
      }
      // If result is null/false, the hook will have already shown the error via toast
    } catch (err) {
      showError(
        t('deliveryDetails.saveError') || 'Failed to save delivery method',
        'Error'
      );
    }
  };

  const handleDelete = (area: DelieveryMethod) => {
    setDeleteModal({ isOpen: true, area });
  };

  const confirmDelete = async () => {
    if (deleteModal.area?._id) {
      try {
        const result = await deleteDeliveryMethod(deleteModal.area._id);
        // If deletion was successful, the hook will have already shown success toast
        if (!result) {
          // If result is false, error was already shown by hook
          console.error('Failed to delete delivery method');
        }
      } catch (err) {
        showError(
          t('deliveryDetails.deleteError') || 'Failed to delete delivery method',
          'Error'
        );
      }
      setDeleteModal({ isOpen: false, area: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, area: null });
  };

  const handleToggleActive = async (area: DelieveryMethod) => {
    if (area._id) {
      try {
        const result = await toggleActiveStatus(area._id);
        // If toggle was successful, the hook will have already shown success toast
        if (!result) {
          // If result is null, error was already shown by hook
          console.error('Failed to toggle delivery method status');
        }
      } catch (err) {
        showError(
          t('deliveryDetails.toggleError') || 'Failed to toggle delivery method status',
          'Error'
        );
      }
    }
  };

  const handleSetDefault = async (area: DelieveryMethod) => {
    if (area._id) {
      try {
        const result = await setAsDefault(area._id);
        // If set default was successful, the hook will have already shown success toast
        if (!result) {
          // If result is null, error was already shown by hook
          console.error('Failed to set default delivery method');
        }
      } catch (err) {
        showError(
          t('deliveryDetails.setDefaultError') || 'Failed to set default delivery method',
          'Error'
        );
      }
    }
  };

  return (
    <div className='bg-white sm:p-4'>
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('deliveryDetails.title') || 'Delivery Methods', href: '/delivery-methods' }
      ]} isRtl={language === 'ARABIC'} />
      
      <HeaderWithAction
        title={t('deliveryDetails.title')}
        addLabel={t('deliveryDetails.addNewDeliveryArea')}
        onAdd={openDrawer}
        isRtl={language === 'ARABIC'}
        count={areas.length}
        loading={loading}
      />

      {/* Rate Limiting Indicator */}
      {isRateLimited && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">
                {t('deliveryDetails.rateLimited') || 'Rate Limited'}
              </span>
              {getTimeRemaining() && (
                <span className="text-yellow-600 text-sm">
                  ({t('deliveryDetails.retryIn') || 'Retry in'} {getTimeRemaining()})
                </span>
              )}
            </div>
            <button
              onClick={handleRetry}
              disabled={loading || getTimeRemaining() !== null}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('deliveryDetails.retrying') || 'Retrying...') : (t('deliveryDetails.retry') || 'Retry')}
            </button>
          </div>
        </div>
      )}
    
      {loading && areas.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className='flex flex-wrap gap-2'>
          {areas.map(area => (
            <DlieveryCard
              key={area._id}
              area={area}
              onManage={() => openDrawerEdit(area)}
              onClick={() => openDrawerEdit(area)}
              onEdit={() => openDrawerEdit(area)}
              onDelete={() => handleDelete(area)}
              onToggleActive={() => handleToggleActive(area)}
              onSetDefault={() => handleSetDefault(area)}
              language={language}
              loading={loading}
            />
          ))}
        </div>
      )}

      <Delieverydrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        area={current}
        language={language}
        isEditMode={isEditMode}
        loading={loading}
      />

      {/* Permission Modal for Delete */}
      <PermissionModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t('deliveryDetails.deleteConfirmTitle')}
        message={t('deliveryDetails.deleteConfirmMessage')}
        itemName={deleteModal.area ? (language === 'ARABIC' ? deleteModal.area.locationAr : deleteModal.area.locationEn) : ''}
        itemType={t('deliveryDetails.deliveryArea')}
        requirePermission={true}
        confirmButtonText={t('deliveryDetails.delete')}
        cancelButtonText={t('deliveryDetails.cancel')}
        isRTL={language === 'ARABIC'}
        severity="danger"
        
      />
    </div>
  );
};

export default DeliveryMethods;
