import { useState, useCallback } from 'react';
import { BASE_URL } from '../constants/api';
import { useToastContext } from '../contexts/ToastContext';

const API_BASE = `${BASE_URL}wholesalers`;

export interface Wholesaler {
  _id?: string;
  store: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  discount: number;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  businessName?: string;
  businessLicense?: string;
  taxNumber?: string;
  contactPerson?: string;
  phone?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  settings?: {
    autoApproval?: boolean;
    creditLimit?: number;
    paymentTerms?: number;
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
  };
  notes?: string;
  isVerified?: boolean;
  verificationDate?: string;
  verifiedBy?: string;
  lastActivity?: string;
  registrationDate?: string;
}

export function useWholesalers(storeId: string, token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const { showSuccess, showError } = useToastContext();

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

  // Get all wholesalers
  const getWholesalers = useCallback(async (params: any = {}) => {
    try {
      let url = `${API_BASE}/stores/${storeId}/wholesalers`;
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
      const data = await fetchWithAuth(url);
      setWholesalers(data.data.wholesalers || []);
      setPagination(data.data.pagination || null);
      setStats(data.data.stats || null);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to fetch wholesalers');
      throw err;
    }
  }, [storeId, fetchWithAuth, showError]);

  // Get single wholesaler
  const getWholesaler = useCallback(async (wholesalerId: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to fetch wholesaler');
      throw err;
    }
  }, [storeId, fetchWithAuth, showError]);

  // Create wholesaler
  const createWholesaler = useCallback(async (wholesaler: Partial<Wholesaler>) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers`;
      const data = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(wholesaler),
      });
      showSuccess('Wholesaler created successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to create wholesaler');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Update wholesaler
  const updateWholesaler = useCallback(async (wholesalerId: string, update: Partial<Wholesaler>) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      showSuccess('Wholesaler updated successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to update wholesaler');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Delete wholesaler
  const deleteWholesaler = useCallback(async (wholesalerId: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url, {
        method: 'DELETE',
      });
      showSuccess('Wholesaler deleted successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to delete wholesaler');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Verify wholesaler
  const verifyWholesaler = useCallback(async (wholesalerId: string, verifiedBy: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}/verify`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ verifiedBy }),
      });
      showSuccess('Wholesaler verified successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to verify wholesaler');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Update status
  const updateStatus = useCallback(async (wholesalerId: string, status: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}/status`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showSuccess('Wholesaler status updated successfully');
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to update wholesaler status');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (wholesalerIds: string[], status: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/bulk/status`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ wholesalerIds, status }),
      });
      showSuccess(`${wholesalerIds.length} wholesalers status updated successfully`);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to bulk update wholesaler status');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Bulk delete
  const bulkDelete = useCallback(async (wholesalerIds: string[]) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/bulk`;
      const data = await fetchWithAuth(url, {
        method: 'DELETE',
        body: JSON.stringify({ wholesalerIds }),
      });
      showSuccess(`${wholesalerIds.length} wholesalers deleted successfully`);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to bulk delete wholesalers');
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError]);

  // Get stats only
  const getStats = useCallback(async () => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/stats`;
      const data = await fetchWithAuth(url);
      setStats(data.data);
      return data.data;
    } catch (err: any) {
      showError(err.message || 'Failed to fetch wholesaler statistics');
      throw err;
    }
  }, [storeId, fetchWithAuth, showError]);

  return {
    loading,
    error,
    wholesalers,
    pagination,
    stats,
    getWholesalers,
    getWholesaler,
    createWholesaler,
    updateWholesaler,
    deleteWholesaler,
    verifyWholesaler,
    updateStatus,
    bulkUpdateStatus,
    bulkDelete,
    getStats,
  };
} 