import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { updateStoreData } from './useLocalStorage';


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
  mainColor: string;        // اللون الرئيسي للمتجر
  language: string;         // اللغة الافتراضية
  currency: string;         // عملة المتجر
  storeDiscount: number;    // نسبة الخصم
  timezone: string;         // المنطقة الزمنية
  taxRate: number;          // نسبة الضريبة
  shippingEnabled: boolean; // تفعيل الشحن
  storeSocials: StoreSocials; // روابط السوشال ميديا
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
  nameAr: string;           // اسم المتجر بالعربية
  nameEn: string;           // اسم المتجر بالإنجليزية
  descriptionAr?: string;   // وصف المتجر بالعربية
  descriptionEn?: string;   // وصف المتجر بالإنجليزية
  slug: string;             // رابط المتجر
  logo: {
    public_id: string | null;
    url: string | null;
  };
  settings: StoreSettings;
  whatsappNumber: string;   // رقم الواتساب
  contact: StoreContact;
}


interface StoreResponse {
  _id?: string;
  id?: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  logo: Array<{
    url: string;
    key: string;
    originalName: string;
    size: number;
    mimetype: string;
  }> | {
    public_id: string | null;
    url: string | null;
  };
  status: 'active' | 'inactive' | 'suspended';
  settings: StoreSettings;
  whatsappNumber: string;
  contact: StoreContact;
  createdAt: string;
  updatedAt?: string;
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

 
  const handleApiError = (err: any, defaultMessage: string): string => {
    const errorMessage = err.response?.data?.message || err.message || defaultMessage;
    setError(errorMessage);
    //CONSOLE.error(`❌ ${defaultMessage}:`, errorMessage);
    return errorMessage;
  };

  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

 
  const createStore = async (storeData: StoreData): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('🆕 إنشاء متجر جديد:', storeData);
      
      const response = await axios.post<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores`,
        storeData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        //CONSOLE.log('✅ تم إنشاء المتجر بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في إنشاء المتجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء إنشاء المتجر');
      return null;
    } finally {
      setLoading(false);
    }
  };

 
  const getStores = async (): Promise<StoreResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('📋 جلب جميع المتاجر...');
      
      const response = await axios.get<ApiResponse<StoreResponse[]>>(
        `${BASE_URL}stores`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        //CONSOLE.log('✅ تم جلب المتاجر بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب المتاجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء جلب المتاجر');
      return [];
    } finally {
      setLoading(false);
    }
  };

// -----------------------------------------------getStore---------------------------------------------------------
  const getStore = async (storeId: string): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('🔍 جلب متجر واحد:', storeId);
      
      const response = await axios.get<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores/${storeId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const storeData = response.data.data;
        //CONSOLE.log('✅ تم جلب المتجر بنجاح:', storeData);
        
        // تحديث البيانات في localStorage
        if (storeData) {
          updateStoreData(storeData);
        }
        
        return storeData || null;
      } else {
        throw new Error(response.data.message || 'فشل في جلب المتجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء جلب المتجر');
      return null;
    } finally {
      setLoading(false);
    }
  };

// -----------------------------------------------updateStore---------------------------------------------------------
  const updateStore = async (storeId: string, updateData: Partial<StoreData>): Promise<StoreResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('🔄 تحديث متجر:', storeId);
      //CONSOLE.log('📤 البيانات المراد تحديثها:', updateData);
      
      const response = await axios.put<ApiResponse<StoreResponse>>(
        `${BASE_URL}stores/${storeId}`,
        updateData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const storeData = response.data.data;
        //CONSOLE.log('✅ تم تحديث المتجر بنجاح:', storeData);
        
        // تحديث البيانات في localStorage
        if (storeData) {
          updateStoreData(storeData);
        }
        
        return storeData || null;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث المتجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء تحديث المتجر');
      return null;
    } finally {
      setLoading(false);
    }
  };

// -----------------------------------------------deleteStore---------------------------------------------------------
  const deleteStore = async (storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('🗑️ حذف متجر:', storeId);
      
      const response = await axios.delete<ApiResponse<null>>(
        `${BASE_URL}stores/${storeId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        //CONSOLE.log('✅ تم حذف المتجر بنجاح');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في حذف المتجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء حذف المتجر');
      return false;
    } finally {
      setLoading(false);
    }
  };

 
// -----------------------------------------------uploadStoreLogo---------------------------------------------------------
  const uploadStoreLogo = async (
    file: File, 
    storeId?: string
  ): Promise<{ public_id: string; url: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      //CONSOLE.log('📤 رفع لوجو المتجر:', file.name);
      //CONSOLE.log('🏪 معرف المتجر:', storeId || 'غير محدد');
      
    
      const formData = new FormData();
      
      // إضافة الصورة باسم 'image' كما يتوقعه الباك إند
      formData.append('image', file);
      
      // إضافة معرف المتجر إذا كان موجوداً
      if (storeId) {
        formData.append('storeId', storeId);
      }
      
      // إضافة مجلد التخزين
      formData.append('folder', 'stores');

      const response = await axios.post<ApiResponse<Array<{
        url: string;
        key: string;
        // originalName: string;
        // size: number;
        // mimetype: string;
      }>>>(
        `${BASE_URL}stores/upload-image`,
        formData,
        {
          headers: {
           
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const uploadedImage = response.data.data[0];
        const result = {
          public_id: uploadedImage.key,
          url: uploadedImage.url
        };
        
        //CONSOLE.log('✅ تم رفع لوجو المتجر بنجاح:', result);
        return result;
      } else {
        throw new Error(response.data.message || 'فشل في رفع لوجو المتجر');
      }
    } catch (err: any) {
      handleApiError(err, 'حدث خطأ أثناء رفع لوجو المتجر');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // RETURN VALUES
  // ========================================================================

  return {
    // State
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