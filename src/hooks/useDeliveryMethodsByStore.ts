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
    clearError,
  };
};

export default useDeliveryMethodsByStore; 