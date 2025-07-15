import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

interface UserAddress {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: 'superadmin' | 'admin' | 'client';
  status?: 'active' | 'inactive' | 'banned';
  addresses: UserAddress[];
  store?: string | { _id: string }; // Store ID for clients (string or object)
}

interface UserResponse {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  addresses: UserAddress[];
  avatar: {
    public_id: string | null;
    url: string;
  };
  isEmailVerified: boolean;
  lastLogin?: string;
  isActive: boolean;
  store?: string | { _id: string };
  createdAt: string;
  updatedAt?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // إنشاء مستخدم جديد
  const createUser = async (userData: UserData): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse<UserResponse>>(
        `${BASE_URL}users`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم إنشاء المستخدم بنجاح:', response.data.data);
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في إنشاء المستخدم');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء المستخدم';
      setError(errorMessage);
      console.error('❌ خطأ في إنشاء المستخدم:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول
  const loginUser = async (email: string, password: string): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${BASE_URL}auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم تسجيل الدخول بنجاح');
        
        // حفظ التوكن في localStorage
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في تسجيل الدخول');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      console.error('❌ خطأ في تسجيل الدخول:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ تم تسجيل الخروج بنجاح');
  };

  // الحصول على معلومات المستخدم الحالي
  const getCurrentUser = (): UserResponse | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (err) {
      console.error('❌ خطأ في قراءة بيانات المستخدم:', err);
      return null;
    }
  };

  // التحقق من وجود توكن صالح
  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // تحديث معلومات المستخدم
  const updateUser = async (userId: string, updateData: Partial<UserData>): Promise<UserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<ApiResponse<UserResponse>>(
        `${BASE_URL}users/${userId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم تحديث المستخدم بنجاح:', response.data.data);
        
        // تحديث البيانات المحلية
        if (response.data.data) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        
        return response.data.data || null;
      } else {
        throw new Error(response.data.message || 'فشل في تحديث المستخدم');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحديث المستخدم';
      setError(errorMessage);
      console.error('❌ خطأ في تحديث المستخدم:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // حذف المستخدم
  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete<ApiResponse<null>>(
        `${BASE_URL}users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم حذف المستخدم بنجاح');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في حذف المستخدم');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء حذف المستخدم';
      setError(errorMessage);
      console.error('❌ خطأ في حذف المستخدم:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse<null>>(
        `${BASE_URL}auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم إرسال رابط إعادة تعيين كلمة المرور');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في إرسال رابط إعادة التعيين');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
      setError(errorMessage);
      console.error('❌ خطأ في إرسال رابط إعادة التعيين:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // جلب جميع المستخدمين
  const getAllUsers = async (): Promise<UserResponse[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ApiResponse<UserResponse[]>>(
        `${BASE_URL}users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log('✅ تم جلب المستخدمين بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب المستخدمين');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المستخدمين';
      setError(errorMessage);
      console.error('❌ خطأ في جلب المستخدمين:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // التحقق من وجود البريد الإلكتروني
  const checkEmailExists = async (email: string): Promise<boolean> => {
    console.log('🔍 جاري التحقق من البريد الإلكتروني:', email);
    
    try {
      const users = await getAllUsers();
      const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        console.log('❌ البريد الإلكتروني مستخدم بالفعل:', email);
      } else {
        console.log('✅ البريد الإلكتروني متاح:', email);
      }
      
      return emailExists;
    } catch (error) {
      console.error('❌ خطأ في التحقق من البريد الإلكتروني:', error);
      return false; // في حالة الخطأ، نعتبر أن البريد متاح
    }
  };

  return {
    loading,
    error,
    createUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    isAuthenticated,
    updateUser,
    deleteUser,
    resetPassword,
    getAllUsers,
    checkEmailExists,
  };
};
 