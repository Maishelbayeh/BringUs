import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { useToastContext } from '../contexts/ToastContext';
import useLanguage from './useLanguage';

interface StoreOwner {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    isActive: boolean;
  };
  status: string;
  permissions: string[];
  isPrimaryOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoreContact {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface StoreSettings {
  currency: string;
  mainColor: string;
  language: string;
  storeDiscount: number;
  timezone: string;
  taxRate: number;
  shippingEnabled: boolean;
  storeSocials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    telegram?: string;
    snapchat?: string;
    pinterest?: string;
    tiktok?: string;
  };
}

interface Store {
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  logo: {
    public_id: string;
    url: string;
  };
  slug: string;
  status: 'active' | 'inactive';
  settings: StoreSettings;
  whatsappNumber: string;
  contact: StoreContact;
  owners: StoreOwner[];
  createdAt: string;
  updatedAt: string;
}

interface StoresResponse {
  success: boolean;
  data: Store[];
  count: number;
  message?: string;
  messageAr?: string;
  message_en?: string;
  message_ar?: string;
  error?: string;
  errorAr?: string;
  error_en?: string;
  error_ar?: string;
}

interface StatusUpdateResponse {
  success: boolean;
  message: string;
  messageAr?: string;
  message_en?: string;
  message_ar?: string;
  error?: string;
  errorAr?: string;
  error_en?: string;
  error_ar?: string;
}

export const useSuperAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cachedStores, setCachedStores] = useState<Store[]>([]);
  const CACHE_DURATION = 60000; // 60 ثانية (دقيقة واحدة)
  const { showSuccess, showError } = useToastContext();
  const { isRTL } = useLanguage();

  // جلب جميع المتاجر
  const getAllStores = async (): Promise<Store[]> => {
    // تحقق من الكاش لتجنب الطلبات المتكررة
    const now = Date.now();
    if (now - lastFetchTime < CACHE_DURATION && cachedStores.length > 0 && !loading) {
      console.log('🔄 استخدام البيانات المخزنة مؤقتاً');
      return cachedStores;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<StoresResponse>(
        `${BASE_URL}superadmin/stores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      if (response.data.success) {
        setLastFetchTime(Date.now());
        setCachedStores(response.data.data);
        return response.data.data;
      } else {
        const errorMessage = isRTL 
          ? (response.data?.messageAr || response.data?.message_ar || 'فشل في جلب المتاجر')
          : (response.data?.message || response.data?.message_en || 'Failed to fetch stores');
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      let errorMessage = isRTL ? 'حدث خطأ أثناء جلب المتاجر' : 'An error occurred while fetching stores';
      let errorTitle = isRTL ? 'خطأ' : 'Error';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = isRTL ? 'انتهت مهلة الطلب - الخادم لا يستجيب' : 'Request timeout - server is not responding';
        errorTitle = isRTL ? 'خطأ في الاتصال' : 'Connection Error';
      } else if (err.response) {
        const errorData = err.response.data;
        
        // إذا كان الخطأ 429 (Too Many Requests)، انتظر فترة أطول
        if (err.response.status === 429) {
          setLastFetchTime(Date.now() + 120000); // انتظر دقيقتين إضافيتين
          errorMessage = isRTL 
            ? (errorData?.messageAr || errorData?.message_ar || 'طلبات كثيرة جداً - يرجى الانتظار لحظة والمحاولة مرة أخرى')
            : (errorData?.message || errorData?.message_en || 'Too many requests - please wait a moment and try again');
          errorTitle = isRTL ? 'تحذير' : 'Warning';
        } else {
          errorMessage = isRTL 
            ? (errorData?.messageAr || errorData?.message_ar || `خطأ في الخادم: ${err.response.status}`)
            : (errorData?.message || errorData?.message_en || `Server error: ${err.response.status}`);
          errorTitle = isRTL 
            ? (errorData?.errorAr || errorData?.error_ar || 'خطأ في الخادم')
            : (errorData?.error || errorData?.error_en || 'Server Error');
        }
      } else if (err.request) {
        errorMessage = isRTL ? 'لا يوجد رد من الخادم - يرجى التحقق من اتصالك' : 'No response from server - please check your connection';
        errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة المتجر
  const updateStoreStatus = async (storeId: string, status: 'active' | 'inactive'): Promise<boolean> => {
    // تجنب إرسال طلبات متكررة
    if (loading) {
      console.log('🔄 طلب قيد التنفيذ، انتظر...');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put<StatusUpdateResponse>(
        `${BASE_URL}superadmin/stores/${storeId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      if (response.data.success) {
        // تحديث الكاش
        setCachedStores(prevStores => 
          prevStores.map(store => 
            store._id === storeId 
              ? { ...store, status } 
              : store
          )
        );
        // إعادة تعيين وقت الكاش لتجنب الطلبات المتكررة
        setLastFetchTime(Date.now());
        
        // Show success message
        const successMessage = isRTL 
          ? (response.data?.messageAr || response.data?.message_ar || 'تم تحديث حالة المتجر بنجاح')
          : (response.data?.message || response.data?.message_en || 'Store status updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return true;
      } else {
        const errorMessage = isRTL 
          ? (response.data?.messageAr || response.data?.message_ar || 'فشل في تحديث حالة المتجر')
          : (response.data?.message || response.data?.message_en || 'Failed to update store status');
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      let errorMessage = isRTL ? 'حدث خطأ أثناء تحديث حالة المتجر' : 'An error occurred while updating store status';
      let errorTitle = isRTL ? 'خطأ' : 'Error';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = isRTL ? 'انتهت مهلة الطلب - الخادم لا يستجيب' : 'Request timeout - server is not responding';
        errorTitle = isRTL ? 'خطأ في الاتصال' : 'Connection Error';
      } else if (err.response) {
        const errorData = err.response.data;
        
        // إذا كان الخطأ 429 (Too Many Requests)، انتظر فترة أطول
        if (err.response.status === 429) {
          setLastFetchTime(Date.now() + 120000); // انتظر دقيقتين إضافيتين
          errorMessage = isRTL 
            ? (errorData?.messageAr || errorData?.message_ar || 'طلبات كثيرة جداً - يرجى الانتظار لحظة والمحاولة مرة أخرى')
            : (errorData?.message || errorData?.message_en || 'Too many requests - please wait a moment and try again');
          errorTitle = isRTL ? 'تحذير' : 'Warning';
        } else {
          errorMessage = isRTL 
            ? (errorData?.messageAr || errorData?.message_ar || `خطأ في الخادم: ${err.response.status}`)
            : (errorData?.message || errorData?.message_en || `Server error: ${err.response.status}`);
          errorTitle = isRTL 
            ? (errorData?.errorAr || errorData?.error_ar || 'خطأ في الخادم')
            : (errorData?.error || errorData?.error_en || 'Server Error');
        }
      } else if (err.request) {
        errorMessage = isRTL ? 'لا يوجد رد من الخادم - يرجى التحقق من اتصالك' : 'No response from server - please check your connection';
        errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllStores,
    updateStoreStatus,
    loading,
    error
  };
}; 