import { useState, useEffect, useCallback } from 'react';
import { DelieveryMethod, ApiResponse } from '../Types';
import { BASE_URL } from '../constants/api';
import { handleApiError } from '../utils/handleApiError';
import useLanguage from './useLanguage';
import { useToastContext } from '../contexts/ToastContext';

interface DeliveryMethodsResponse extends ApiResponse<DelieveryMethod[]> {}

interface UseDeliveryMethodsByStoreOptions {
  isActive?: boolean;
  isDefault?: boolean;
  autoFetch?: boolean;
}

const useDeliveryMethodsByStore = (
  storeId: string,
  options: UseDeliveryMethodsByStoreOptions = {}
) => {
  const { t } = useLanguage();
  const { showSuccess } = useToastContext();
  const [deliveryMethods, setDeliveryMethods] = useState<DelieveryMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastToastTime, setLastToastTime] = useState<number>(0);

  // Helper function to show success toast with debouncing
  const showSuccessToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastToastTime > 1000) { // Prevent showing same toast within 1 second
      setLastToastTime(now);
      showSuccess(message);
    }
  }, [showSuccess, lastToastTime]);

  const buildQueryString = (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  };

  // Fetch delivery methods by store ID
  const fetchDeliveryMethods = useCallback(async (fetchOptions: { isActive?: boolean; isDefault?: boolean } = {}) => {
    if (!storeId) {
      setError(t('deliveryDetails.errors.storeIdRequired'));
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryString({
        isActive: fetchOptions.isActive ?? options.isActive,
        isDefault: fetchOptions.isDefault ?? options.isDefault,
      });

      const response = await fetch(`${BASE_URL}delivery-methods/store/${storeId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t('deliveryDetails.errors.unauthorized'));
        } else if (response.status === 403) {
          throw new Error(t('deliveryDetails.errors.forbidden'));
        } else if (response.status === 404) {
          throw new Error(t('deliveryDetails.errors.notFound'));
        } else if (response.status >= 500) {
          throw new Error(t('deliveryDetails.errors.serverError'));
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: DeliveryMethodsResponse = await response.json();

      if (data.success) {
        setDeliveryMethods(data.data || []);
        // Don't show success toast for fetch operations
        return data.data || [];
      } else {
        setError(data.message || t('deliveryDetails.errors.fetchError'));
        return [];
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [storeId, options.isActive, options.isDefault]);

  // Get only active delivery methods
  const fetchActiveDeliveryMethods = useCallback(async () => {
    return await fetchDeliveryMethods({ isActive: true });
  }, [fetchDeliveryMethods]);

  // Get only default delivery method
  const fetchDefaultDeliveryMethod = useCallback(async () => {
    return await fetchDeliveryMethods({ isDefault: true });
  }, [fetchDeliveryMethods]);

  // Create delivery method
  const createDeliveryMethod = useCallback(async (deliveryMethodData: Partial<DelieveryMethod>) => {
    setLoading(true);
    setError(null);

    try {
      // Prevent creating default method as inactive
      if (deliveryMethodData.isDefault && deliveryMethodData.isActive === false) {
        setError(t('deliveryDetails.errors.defaultCannotBeCreatedInactive'));
        return null;
      }

      // Get storeId from localStorage
      const finalStoreId = localStorage.getItem('storeId');
      
      if (!finalStoreId) {
        setError(t('deliveryDetails.errors.storeIdRequired'));
        return null;
      }

      // Add storeId to the request body
      const requestData = { ...deliveryMethodData, store: finalStoreId };

      const response = await fetch(`${BASE_URL}delivery-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Default method cannot be inactive') {
          setError(t('deliveryDetails.errors.defaultCannotBeCreatedInactive'));
          return null;
        }
        if (response.status === 401) {
          throw new Error(t('deliveryDetails.errors.unauthorized'));
        } else if (response.status === 403) {
          throw new Error(t('deliveryDetails.errors.forbidden'));
        } else if (response.status === 404) {
          throw new Error(t('deliveryDetails.errors.notFound'));
        } else if (response.status >= 500) {
          throw new Error(t('deliveryDetails.errors.serverError'));
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: ApiResponse<DelieveryMethod> = await response.json();

      if (data.success) {
        // Update the list directly instead of refetching
        if (data.data) {
          setDeliveryMethods(prev => [...prev, data.data as DelieveryMethod]);
        }
        const successMessage = t('deliveryDetails.success.createSuccess');
        //CONSOLE.log('Create success, showing toast:', successMessage);
        showSuccessToast(successMessage);
        return data.data;
      } else {
        setError(data.message || t('deliveryDetails.errors.createError'));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false && storeId) {
      fetchDeliveryMethods();
    }
  }, [storeId, options.autoFetch]); // Remove fetchDeliveryMethods from dependencies

  return {
    deliveryMethods,
    loading,
    error,
    fetchDeliveryMethods,
    fetchActiveDeliveryMethods,
    fetchDefaultDeliveryMethod,
    createDeliveryMethod,
    clearError,
  };
};

export default useDeliveryMethodsByStore; 