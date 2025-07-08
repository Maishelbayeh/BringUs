import React, { useEffect } from 'react';
import useDeliveryMethodsByStore from '../../hooks/useDeliveryMethodsByStore';
import { useToastContext } from '../../contexts/ToastContext';

const SimpleDeliveryTest: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToastContext();
  const storeId = '686a719956a82bfcc93a2e2d';

  const {
    deliveryMethods,
    loading,
    error,
    fetchDeliveryMethods,
    fetchActiveDeliveryMethods,
    fetchDefaultDeliveryMethod
  } = useDeliveryMethodsByStore(storeId, {
    autoFetch: true
  });

  useEffect(() => {
    if (error) {
      showError(error, 'Error');
    }
  }, [error, showError]);

  useEffect(() => {
    if (!loading && deliveryMethods.length > 0) {
      showSuccess(`Found ${deliveryMethods.length} delivery methods`);
    }
  }, [loading, deliveryMethods.length, showSuccess]);

  const handleRefresh = async () => {
    showInfo('Refreshing...');
    await fetchDeliveryMethods();
  };

  const handleGetActive = async () => {
    showInfo('Getting active methods...');
    const active = await fetchActiveDeliveryMethods();
    showSuccess(`Found ${active.length} active methods`);
  };

  const handleGetDefault = async () => {
    showInfo('Getting default method...');
    const defaultMethod = await fetchDefaultDeliveryMethod();
    if (defaultMethod.length > 0) {
      showSuccess(`Default: ${defaultMethod[0].locationEn}`);
    } else {
      showError('No default method found');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Delivery Methods Test</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh All
        </button>
        <button
          onClick={handleGetActive}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Get Active
        </button>
        <button
          onClick={handleGetDefault}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Get Default
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {!loading && deliveryMethods.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Delivery Methods ({deliveryMethods.length}):</h3>
          {deliveryMethods.map((method) => (
            <div
              key={method._id}
              className={`p-3 border rounded ${
                method.isDefault ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <strong>{method.locationEn}</strong> ({method.locationAr})
                  <br />
                  <span className="text-sm text-gray-600">
                    {method.price} ILS • {method.estimatedDays} days
                  </span>
                </div>
                <div className="flex gap-1">
                  {method.isDefault && (
                    <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded">
                      Default
                    </span>
                  )}
                  {method.isActive ? (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && deliveryMethods.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No delivery methods found
        </div>
      )}
    </div>
  );
};

export default SimpleDeliveryTest; 