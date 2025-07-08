import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useDeliveryMethodsByStore from '../../hooks/useDeliveryMethodsByStore';
import { useToastContext } from '../../contexts/ToastContext';
import useLanguage from '../../hooks/useLanguage';

interface DeliveryMethodsExampleProps {
  storeId: string;
  showActiveOnly?: boolean;
  showDefaultOnly?: boolean;
}

const DeliveryMethodsExample: React.FC<DeliveryMethodsExampleProps> = ({
  storeId,
  showActiveOnly = false,
  showDefaultOnly = false,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { showSuccess, showError, showInfo, showWarning } = useToastContext();

  const {
    deliveryMethods,
    loading,
    error,
    fetchDeliveryMethods,
    fetchActiveDeliveryMethods,
    fetchDefaultDeliveryMethod,
    clearError,
  } = useDeliveryMethodsByStore(storeId, {
    isActive: showActiveOnly,
    isDefault: showDefaultOnly,
    autoFetch: true,
  });

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError(error, 'Error');
      clearError();
    }
  }, [error, showError, clearError]);

  // Show success toast when data is loaded
  useEffect(() => {
    if (!loading && deliveryMethods.length > 0) {
      showSuccess(
        `Found ${deliveryMethods.length} delivery method(s)`,
        'Success'
      );
    }
  }, [loading, deliveryMethods.length, showSuccess]);

  const handleRefresh = async () => {
    showInfo('Refreshing delivery methods...', 'Info');
    await fetchDeliveryMethods();
  };

  const handleGetActiveOnly = async () => {
    showInfo('Fetching active delivery methods...', 'Info');
    const activeMethods = await fetchActiveDeliveryMethods();
    if (activeMethods.length > 0) {
      showSuccess(`Found ${activeMethods.length} active delivery method(s)`, 'Success');
    } else {
      showWarning('No active delivery methods found', 'Warning');
    }
  };

  const handleGetDefaultOnly = async () => {
    showInfo('Fetching default delivery method...', 'Info');
    const defaultMethods = await fetchDefaultDeliveryMethod();
    if (defaultMethods.length > 0) {
      showSuccess(`Default method: ${defaultMethods[0].locationEn}`, 'Success');
    } else {
      showWarning('No default delivery method found', 'Warning');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          {t('common.loading') || 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t('deliveryDetails.title') || 'Delivery Methods'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('common.refresh') || 'Refresh'}
          </button>
          <button
            onClick={handleGetActiveOnly}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {t('deliveryDetails.activeOnly') || 'Active Only'}
          </button>
          <button
            onClick={handleGetDefaultOnly}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            {t('deliveryDetails.defaultOnly') || 'Default Only'}
          </button>
        </div>
      </div>

      {deliveryMethods.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {t('deliveryDetails.noMethods') || 'No delivery methods found'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deliveryMethods.map((method) => (
            <div
              key={method._id}
              className={`border rounded-lg p-4 transition-all ${
                method.isDefault
                  ? 'border-purple-500 bg-purple-50'
                  : method.isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">
                  {language === 'ARABIC' ? method.locationAr : method.locationEn}
                </h3>
                <div className="flex gap-1">
                  {method.isDefault && (
                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                      {t('deliveryDetails.default') || 'Default'}
                    </span>
                  )}
                  {method.isActive ? (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                      {t('deliveryDetails.active') || 'Active'}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                      {t('deliveryDetails.inactive') || 'Inactive'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">
                    {t('deliveryDetails.price') || 'Price'}:
                  </span>{' '}
                  {method.price} ILS
                </p>
                <p>
                  <span className="font-medium">
                    {t('deliveryDetails.estimatedDays') || 'Estimated Days'}:
                  </span>{' '}
                  {method.estimatedDays} {t('common.days') || 'days'}
                </p>
                <p>
                  <span className="font-medium">
                    {t('deliveryDetails.whatsapp') || 'WhatsApp'}:
                  </span>{' '}
                  {method.whatsappNumber}
                </p>
                {method.descriptionAr && (
                  <p className="text-xs text-gray-500">
                    {language === 'ARABIC' ? method.descriptionAr : method.descriptionEn}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">
                    {t('deliveryDetails.priority') || 'Priority'}:
                  </span>{' '}
                  {method.priority}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {t('deliveryDetails.totalMethods') || 'Total Methods'}: {deliveryMethods.length}
        </p>
      </div>
    </div>
  );
};

export default DeliveryMethodsExample; 