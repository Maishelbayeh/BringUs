import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

interface OwnerData {
  userId: string;
  storeId: string;
  status: 'active'| 'inactive' ;
  permissions?: string[];
  isPrimaryOwner?: boolean;
}

interface OwnerResponse {
  _id: string;
  userId: string;
  storeId: string;
  status: string;
  permissions: string[];
   isPrimaryOwner: boolean;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  store?: {
    _id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useOwner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ربط مستخدم بمتجر (إنشاء owner)
  const createOwner = async (ownerData: OwnerData): Promise<OwnerResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<ApiResponse<OwnerResponse>>(
        `${BASE_URL}owners`,
        ownerData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم ربط المستخدم بالمتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في ربط المستخدم بالمتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء ربط المستخدم بالمتجر';
      setError(errorMessage);
      console.error('❌ خطأ في ربط المستخدم بالمتجر:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // الحصول على جميع owners
  const getOwners = async (): Promise<OwnerResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<OwnerResponse[]>>(
        `${BASE_URL}owners`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب owners بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب owners');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب owners';
      setError(errorMessage);
      console.error('❌ خطأ في جلب owners:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // الحصول على owners متجر معين
  const getStoreOwners = async (storeId: string): Promise<OwnerResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<OwnerResponse[]>>(
        `${BASE_URL}owners/store/${storeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب owners المتجر بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب owners المتجر');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب owners المتجر';
      setError(errorMessage);
      console.error('❌ خطأ في جلب owners المتجر:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // الحصول على متاجر مستخدم معين
  const getUserStores = async (userId: string): Promise<OwnerResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<OwnerResponse[]>>(
        `${BASE_URL}owners/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب متاجر المستخدم بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب متاجر المستخدم');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب متاجر المستخدم';
      setError(errorMessage);
      console.error('❌ خطأ في جلب متاجر المستخدم:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // تحديث owner
  const updateOwner = async (ownerId: string, updateData: Partial<OwnerData>): Promise<OwnerResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<ApiResponse<OwnerResponse>>(
        `${BASE_URL}owners/${ownerId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم تحديث owner بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث owner');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحديث owner';
      setError(errorMessage);
      console.error('❌ خطأ في تحديث owner:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // حذف owner
  const deleteOwner = async (ownerId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete<ApiResponse<null>>(
        `${BASE_URL}owners/${ownerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم حذف owner بنجاح');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في حذف owner');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء حذف owner';
      setError(errorMessage);
      console.error('❌ خطأ في حذف owner:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOwner,
    getOwners,
    getStoreOwners,
    getUserStores,
    updateOwner,
    deleteOwner
  };
}; 