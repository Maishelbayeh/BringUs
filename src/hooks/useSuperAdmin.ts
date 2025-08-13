import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

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
}

interface StatusUpdateResponse {
  success: boolean;
  message: string;
}

export const useSuperAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cachedStores, setCachedStores] = useState<Store[]>([]);
  const CACHE_DURATION = 60000; // 60 ثانية (دقيقة واحدة)

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
        throw new Error(response.data.message || 'Failed to fetch stores');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred while fetching stores';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server is not responding';
      } else if (err.response) {
        // إذا كان الخطأ 429 (Too Many Requests)، انتظر فترة أطول
        if (err.response.status === 429) {
          setLastFetchTime(Date.now() + 120000); // انتظر دقيقتين إضافيتين
          errorMessage = 'Too many requests - please wait a moment and try again';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server - please check your connection';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
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
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update store status');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred while updating store status';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server is not responding';
      } else if (err.response) {
        // إذا كان الخطأ 429 (Too Many Requests)، انتظر فترة أطول
        if (err.response.status === 429) {
          setLastFetchTime(Date.now() + 120000); // انتظر دقيقتين إضافيتين
          errorMessage = 'Too many requests - please wait a moment and try again';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server - please check your connection';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
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