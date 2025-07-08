import { useState, useCallback } from 'react';
import { BASE_URL } from '../constants/api';
import { useToastContext } from '../contexts/ToastContext';

export interface Advertisement {
  _id?: string;
  store: string;
  title: string;
  description?: string;
  htmlContent: string;
  backgroundImageUrl?: string;
  position?: 'top' | 'bottom' | 'sidebar' | 'popup' | 'banner';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority?: number;
  clickCount?: number;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useAdvertisements(storeId: string, token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [activeAd, setActiveAd] = useState<Advertisement | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const { showSuccess, showError } = useToastContext();

  const API_BASE = `${BASE_URL}advertisements/stores/${storeId}/advertisements`;

  // Helper for fetch with auth
  const fetchWithAuth = useCallback(async (url: string, options: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'API Error');
      return data;
    } catch (err: any) {
      setError(err.message || 'API Error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get all advertisements
  const getAdvertisements = useCallback(async (params: any = {}) => {
    try {
      let url = API_BASE;
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
      const data = await fetchWithAuth(url);
      setAdvertisements(data.data.data || data.data || []);
      setPagination(data.data.pagination || null);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to fetch advertisements');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showError]);

  // Get active advertisement
  const getActiveAdvertisement = useCallback(async () => {
    try {
      const url = `${API_BASE}/active`;
      const data = await fetchWithAuth(url);
      setActiveAd(data.data.data || data.data || null);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to fetch active advertisement');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showError]);

  // Create advertisement
  const createAdvertisement = useCallback(async (ad: Partial<Advertisement>) => {
    try {
      const url = API_BASE;
      const data = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(ad),
      });
      showSuccess('Advertisement created successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to create advertisement');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showSuccess, showError]);

  // Update advertisement
  const updateAdvertisement = useCallback(async (adId: string, update: Partial<Advertisement>) => {
    try {
      const url = `${API_BASE}/${adId}`;
      const data = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      showSuccess('Advertisement updated successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to update advertisement');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showSuccess, showError]);

  // Delete advertisement
  const deleteAdvertisement = useCallback(async (adId: string) => {
    try {
      const url = `${API_BASE}/${adId}`;
      const data = await fetchWithAuth(url, {
        method: 'DELETE',
      });
      showSuccess('Advertisement deleted successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to delete advertisement');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showSuccess, showError]);

  // Toggle active status
  const toggleActiveStatus = useCallback(async (adId: string) => {
    try {
      const url = `${API_BASE}/${adId}/toggle-active`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
      });
      showSuccess('Advertisement status updated successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to update advertisement status');
      throw err;
    }
  }, [API_BASE, fetchWithAuth, showSuccess, showError]);

  return {
    loading,
    error,
    advertisements,
    activeAd,
    pagination,
    getAdvertisements,
    getActiveAdvertisement,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    toggleActiveStatus,
  };
} 