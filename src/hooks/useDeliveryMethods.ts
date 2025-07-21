import { useState, useEffect, useCallback, useRef } from 'react';
import { DelieveryMethod, ApiResponse } from '../Types';
import { BASE_URL } from '../constants/api';
import { handleApiError } from '../utils/handleApiError';
import useLanguage from './useLanguage';
import { useToastContext } from '../contexts/ToastContext';

interface DeliveryMethodsResponse extends ApiResponse<DelieveryMethod[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface DeliveryMethodResponse extends ApiResponse<DelieveryMethod> {}

interface UseDeliveryMethodsOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isDefault?: boolean;
  storeId?: string;
}

const useDeliveryMethods = (options: UseDeliveryMethodsOptions = {}) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToastContext();
  const [deliveryMethods, setDeliveryMethods] = useState<DelieveryMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [lastToastTime, setLastToastTime] = useState<number>(0);

  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<Date | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const lastRequestTime = useRef<number>(0);
  const requestCount = useRef<number>(0);

  // Helper function to show success toast with debouncing
  const showSuccessToast = useCallback((message: string) => {
    const now = Date.now();
    if (now - lastToastTime > 1000) { // Prevent showing same toast within 1 second
      setLastToastTime(now);
      showSuccess(message);
    }
  }, [showSuccess, lastToastTime]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  };

  const buildQueryString = (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  };

  // Check if we should wait before making a request
  const shouldWaitForRateLimit = useCallback(() => {
    if (!isRateLimited) return false;
    
    if (rateLimitResetTime) {
      const now = new Date();
      const timeUntilReset = rateLimitResetTime.getTime() - now.getTime();
      if (timeUntilReset > 0) {
        return true;
      } else {
        // Reset time has passed, clear rate limit
        setIsRateLimited(false);
        setRateLimitResetTime(null);
        setRetryAfter(null);
        return false;
      }
    }
    
    if (retryAfter) {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < retryAfter * 1000) {
        return true;
      } else {
        // Retry after time has passed, clear rate limit
        setIsRateLimited(false);
        setRetryAfter(null);
        return false;
      }
    }
    
    return false;
  }, [isRateLimited, rateLimitResetTime, retryAfter]);

  // Simple request with basic rate limiting
  const makeRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    // Check if we're rate limited
    if (shouldWaitForRateLimit()) {
      const waitTime = retryAfter || 60;
      throw new Error(t('deliveryDetails.errors.rateLimited', { seconds: waitTime }));
    }

    // Basic request throttling - don't make requests too frequently
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < 1000) { // Minimum 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
    }

    lastRequestTime.current = Date.now();
    requestCount.current++;

    const response = await fetch(url, options);
    
    // Handle rate limiting
    if (response.status === 429) {
      setIsRateLimited(true);
      
      // Try to get retry-after from headers
      const retryAfterHeader = response.headers.get('Retry-After');
      if (retryAfterHeader) {
        const retryAfterSeconds = parseInt(retryAfterHeader, 10);
        setRetryAfter(retryAfterSeconds);
        setRateLimitResetTime(new Date(Date.now() + retryAfterSeconds * 1000));
      } else {
        // Default to 60 seconds if no retry-after header
        setRetryAfter(60);
        setRateLimitResetTime(new Date(Date.now() + 60 * 1000));
      }
      
      throw new Error(t('deliveryDetails.errors.rateLimited', { seconds: retryAfterHeader || 60 }));
    }

    return response;
  }, [shouldWaitForRateLimit, retryAfter]);

  // Get all delivery methods
  const fetchDeliveryMethods = useCallback(async (fetchOptions: UseDeliveryMethodsOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryString({
        page: fetchOptions.page || options.page || 1,
        limit: fetchOptions.limit || options.limit || 10,
        isActive: fetchOptions.isActive ?? options.isActive,
        isDefault: fetchOptions.isDefault ?? options.isDefault,
        storeId: fetchOptions.storeId || options.storeId,
      });

      const response = await makeRequest(`${BASE_URL}delivery-methods?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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
        if (data.pagination) {
          setPagination(data.pagination);
        }
        // Clear any previous rate limit errors on success
        setIsRateLimited(false);
        setRateLimitResetTime(null);
        setRetryAfter(null);
        // Don't show success toast for initial fetch
      } else {
        setError(data.message || t('deliveryDetails.errors.fetchError'));
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options, makeRequest]);

  // Get delivery methods by store ID (public endpoint)
  const fetchDeliveryMethodsByStoreId = useCallback(async (storeId: string, fetchOptions: { isActive?: boolean; isDefault?: boolean } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryString({
        isActive: fetchOptions.isActive,
        isDefault: fetchOptions.isDefault,
      });

      const response = await makeRequest(`${BASE_URL}delivery-methods/store/${storeId}?${queryParams}`, {
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
        // Clear any previous rate limit errors on success
        setIsRateLimited(false);
        setRateLimitResetTime(null);
        setRetryAfter(null);
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
  }, [makeRequest]);

  // Get delivery method by ID
  const fetchDeliveryMethodById = useCallback(async (id: string, storeId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryString({ storeId });
      const response = await makeRequest(`${BASE_URL}delivery-methods/${id}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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

      const data: DeliveryMethodResponse = await response.json();

      if (data.success) {
        // Don't show success toast for fetch operations
        return data.data;
      } else {
        setError(data.message || t('deliveryDetails.errors.fetchByIdError'));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  // Create delivery method
  const createDeliveryMethod = useCallback(async (deliveryMethodData: Partial<DelieveryMethod>, storeId?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Prevent creating default method as inactive
      if (deliveryMethodData.isDefault && deliveryMethodData.isActive === false) {
        setError(t('deliveryDetails.errors.defaultCannotBeCreatedInactive'));
        return null;
      }

      // Get storeId from localStorage if not provided
      const finalStoreId = storeId || "687505893fbf3098648bfe16";
      
      if (!finalStoreId) {
        setError(t('deliveryDetails.errors.storeIdRequired'));
        return null;
      }

      // Add storeId to the request body
      const requestData = { ...deliveryMethodData, store: finalStoreId };

      const response = await makeRequest(`${BASE_URL}delivery-methods`, {
        method: 'POST',
        headers: getAuthHeaders(),
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

      const data: DeliveryMethodResponse = await response.json();

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
  }, [fetchDeliveryMethods, makeRequest]);

  // Update delivery method
  const updateDeliveryMethod = useCallback(async (id: string, deliveryMethodData: Partial<DelieveryMethod>) => {
    setLoading(true);
    setError(null);

    try {
      // Check if trying to deactivate a default method
      if (deliveryMethodData.isActive === false) {
        const methodToUpdate = deliveryMethods.find(method => method._id === id);
        if (methodToUpdate?.isDefault) {
          setError(t('deliveryDetails.errors.defaultCannotBeUpdatedInactive'));
          return null;
        }
      }

      const response = await makeRequest(`${BASE_URL}delivery-methods/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryMethodData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Default method cannot be inactive') {
          setError(t('deliveryDetails.errors.defaultCannotBeUpdatedInactive'));
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

      const data: DeliveryMethodResponse = await response.json();

      if (data.success) {
        // Update the list
        setDeliveryMethods(prev => 
          prev.map(method => 
            method._id === id ? { ...method, ...data.data } : method
          )
        );
        const successMessage = t('deliveryDetails.success.updateSuccess');
        //CONSOLE.log('Update success, showing toast:', successMessage);
        showSuccessToast(successMessage);
        return data.data;
      } else {
        setError(data.message || t('deliveryDetails.errors.updateError'));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, deliveryMethods]);

  // Delete delivery method
  const deleteDeliveryMethod = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if trying to delete a default method
      const methodToDelete = deliveryMethods.find(method => method._id === id);
      if (methodToDelete?.isDefault) {
        setError(t('deliveryDetails.errors.defaultCannotBeDeleted'));
        return false;
      }

      const response = await makeRequest(`${BASE_URL}delivery-methods/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Default method cannot be deleted') {
          setError(t('deliveryDetails.errors.defaultCannotBeDeleted'));
          return false;
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

      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        // Remove from the list
        setDeliveryMethods(prev => prev.filter(method => method._id !== id));
        const successMessage = t('deliveryDetails.success.deleteSuccess');
        //CONSOLE.log('Delete success, showing toast:', successMessage);
        showSuccessToast(successMessage);
        return true;
      } else {
        setError(data.message || t('deliveryDetails.errors.deleteError'));
        return false;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, deliveryMethods]);

  // Toggle active status
  const toggleActiveStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if this is a default method before attempting to toggle
      const methodToToggle = deliveryMethods.find(method => method._id === id);
      if (methodToToggle?.isDefault && methodToToggle?.isActive) {
        setError(t('deliveryDetails.errors.defaultCannotBeInactive'));
        return null;
      }

      const response = await makeRequest(`${BASE_URL}delivery-methods/${id}/toggle-active`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Default method cannot be inactive') {
          setError(t('deliveryDetails.errors.defaultCannotBeInactive'));
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

      const data: DeliveryMethodResponse = await response.json();

      if (data.success) {
        // Update the list
        setDeliveryMethods(prev => 
          prev.map(method => 
            method._id === id ? { ...method, ...data.data } : method
          )
        );
        // Show specific message based on new status
        const successMessage = data.data?.isActive 
          ? t('deliveryDetails.success.activateSuccess')
          : t('deliveryDetails.success.deactivateSuccess');
        //CONSOLE.log('Toggle active success, showing toast:', successMessage);
        showSuccessToast(successMessage);
        return data.data;
      } else {
        setError(data.message || t('deliveryDetails.errors.toggleActiveError'));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, deliveryMethods]);

  // Set as default
  const setAsDefault = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if trying to set inactive method as default
      const methodToSetDefault = deliveryMethods.find(method => method._id === id);
      if (methodToSetDefault && !methodToSetDefault.isActive) {
        setError(t('deliveryDetails.errors.inactiveCannotBeDefault'));
        return null;
      }

      const response = await makeRequest(`${BASE_URL}delivery-methods/${id}/set-default`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Inactive method cannot be default') {
          setError(t('deliveryDetails.errors.inactiveCannotBeDefault'));
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

      const data: DeliveryMethodResponse = await response.json();

      if (data.success) {
        // Update the list
        setDeliveryMethods(prev => 
          prev.map(method => 
            method._id === id 
              ? { ...method, ...data.data }
              : { ...method, isDefault: false }
          )
        );
        const successMessage = t('deliveryDetails.success.setDefaultSuccess');
        //CONSOLE.log('Setting default success, showing toast:', successMessage);
        showSuccessToast(successMessage);
        return data.data;
      } else {
        setError(data.message || t('deliveryDetails.errors.setDefaultError'));
        return null;
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, deliveryMethods]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear rate limit manually
  const clearRateLimit = useCallback(() => {
    setIsRateLimited(false);
    setRateLimitResetTime(null);
    setRetryAfter(null);
  }, []);

  // Initial fetch - only run once on mount
  useEffect(() => {
    if (deliveryMethods.length === 0) {
      fetchDeliveryMethods();
    }
  }, []); // Empty dependency array to run only once

  return {
    deliveryMethods,
    loading,
    error,
    pagination,
    isRateLimited,
    rateLimitResetTime,
    retryAfter,
    fetchDeliveryMethods,
    fetchDeliveryMethodsByStoreId,
    fetchDeliveryMethodById,
    createDeliveryMethod,
    updateDeliveryMethod,
    deleteDeliveryMethod,
    toggleActiveStatus,
    setAsDefault,
    clearError,
    clearRateLimit,
  };
};

export default useDeliveryMethods; 