import { useState, useCallback } from 'react';
import { BASE_URL } from '../constants/api';
import { useToastContext } from '../contexts/ToastContext';
import useLanguage from './useLanguage';

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
  password?: string;
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
  const { isRTL } = useLanguage();

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
      if (!res.ok) {
        // Throw error with full data for bilingual handling
        const error: any = new Error(data.message || 'API Error');
        error.response = { data };
        throw error;
      }
      return data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMsg = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في الاتصال بالخادم')
        : (errorData?.message || errorData?.message_en || 'Failed to connect to server');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, isRTL]);

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
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في جلب قائمة تجار الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to fetch wholesalers list');
      const errorTitle = isRTL ? 'خطأ في جلب تجار الجملة' : 'Error Fetching Wholesalers';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showError, isRTL]);

  // Get single wholesaler
  const getWholesaler = useCallback(async (wholesalerId: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url);
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في جلب بيانات تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to fetch wholesaler');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showError, isRTL]);

  // Create wholesaler
  const createWholesaler = useCallback(async (wholesaler: Partial<Wholesaler>) => {
    console.log(wholesaler);
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers`;
      const data = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(wholesaler),
      });
      
      // Show success message
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || 'تم إنشاء تاجر الجملة بنجاح')
        : (data?.message || data?.message_en || 'Wholesaler created successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في إنشاء تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to create wholesaler');
      const errorTitle = isRTL ? 'خطأ في الإنشاء' : 'Error Creating';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Update wholesaler
  const updateWholesaler = useCallback(async (wholesalerId: string, update: Partial<Wholesaler>) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(update),
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || 'تم تحديث تاجر الجملة بنجاح')
        : (data?.message || data?.message_en || 'Wholesaler updated successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في تحديث تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to update wholesaler');
      const errorTitle = isRTL ? 'خطأ في التحديث' : 'Error Updating';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Delete wholesaler
  const deleteWholesaler = useCallback(async (wholesalerId: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}`;
      const data = await fetchWithAuth(url, {
        method: 'DELETE',
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || 'تم حذف تاجر الجملة بنجاح')
        : (data?.message || data?.message_en || 'Wholesaler deleted successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في حذف تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to delete wholesaler');
      const errorTitle = isRTL ? 'خطأ في الحذف' : 'Error Deleting';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Verify wholesaler
  const verifyWholesaler = useCallback(async (wholesalerId: string, verifiedBy: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}/verify`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ verifiedBy }),
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || 'تم التحقق من تاجر الجملة بنجاح')
        : (data?.message || data?.message_en || 'Wholesaler verified successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في التحقق من تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to verify wholesaler');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Update status
  const updateStatus = useCallback(async (wholesalerId: string, status: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/${wholesalerId}/status`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || 'تم تحديث حالة تاجر الجملة بنجاح')
        : (data?.message || data?.message_en || 'Wholesaler status updated successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في تحديث حالة تاجر الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to update wholesaler status');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (wholesalerIds: string[], status: string) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/bulk/status`;
      const data = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify({ wholesalerIds, status }),
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || `تم تحديث حالة ${wholesalerIds.length} تاجر جملة بنجاح`)
        : (data?.message || data?.message_en || `${wholesalerIds.length} wholesalers status updated successfully`);
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في تحديث حالة تجار الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to bulk update wholesaler status');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Bulk delete
  const bulkDelete = useCallback(async (wholesalerIds: string[]) => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/bulk`;
      const data = await fetchWithAuth(url, {
        method: 'DELETE',
        body: JSON.stringify({ wholesalerIds }),
      });
      
      const successMessage = isRTL 
        ? (data?.messageAr || data?.message_ar || `تم حذف ${wholesalerIds.length} تاجر جملة بنجاح`)
        : (data?.message || data?.message_en || `${wholesalerIds.length} wholesalers deleted successfully`);
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في حذف تجار الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to bulk delete wholesalers');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showSuccess, showError, isRTL]);

  // Get stats only
  const getStats = useCallback(async () => {
    try {
      const url = `${API_BASE}/stores/${storeId}/wholesalers/stats`;
      const data = await fetchWithAuth(url);
      setStats(data.data);
      return data.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في جلب إحصائيات تجار الجملة')
        : (errorData?.message || errorData?.message_en || 'Failed to fetch wholesaler statistics');
      const errorTitle = isRTL ? 'خطأ' : 'Error';
      showError(errorMessage, errorTitle);
      throw err;
    }
  }, [storeId, fetchWithAuth, showError, isRTL]);

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