import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

interface StoreSocials {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  telegram?: string;
  snapchat?: string;
  pinterest?: string;
  tiktok?: string;
}

interface StoreSettings {
  mainColor: string;
  language: string;
  storeDiscount: number;
  timezone: string;
  taxRate: number;
  shippingEnabled: boolean;
  storeSocials: StoreSocials;
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

interface StoreData {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  logo: {
    public_id: string | null;
    url: string | null;
  };
  settings: StoreSettings;
  whatsappNumber: string;
  contact: StoreContact;
}

interface StoreResponse {
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  logo: {
    public_id: string | null;
    url: string | null;
  };
  status: 'active' | 'inactive' | 'suspended';
  settings: StoreSettings;
  whatsappNumber: string;
  contact: StoreContact;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useStore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // إنشاء متجر جديد
  const createStore = async (storeData: StoreData): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores`,
        storeData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم إنشاء المتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في إنشاء المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في إنشاء المتجر:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // الحصول على جميع المتاجر
  const getStores = async (): Promise<StoreResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<StoreResponse[]>>(
        `${BASE_URL}stores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب المتاجر بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب المتاجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المتاجر';
      setError(errorMessage);
      console.error('❌ خطأ في جلب المتاجر:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // الحصول على متجر واحد
  const getStore = async (storeId: string): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores/${storeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب المتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في جلب المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في جلب المتجر:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تحديث متجر
  const updateStore = async (storeId: string, updateData: Partial<StoreData>): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores/${storeId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم تحديث المتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحديث المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في تحديث المتجر:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // حذف متجر
  const deleteStore = async (storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete<ApiResponse<null>>(
        `${BASE_URL}stores/${storeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم حذف المتجر بنجاح');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في حذف المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء حذف المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في حذف المتجر:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // رفع صورة المتجر
  const uploadStoreLogo = async (file: File): Promise<{ public_id: string; url: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post<ApiResponse<{ public_id: string; url: string }>>(
        `${BASE_URL}stores/upload-logo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم رفع لوجو المتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في رفع لوجو المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء رفع لوجو المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في رفع لوجو المتجر:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createStore,
    getStores,
    getStore,
    updateStore,
    deleteStore,
    uploadStoreLogo,
  };
}; 