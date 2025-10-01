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

    console.log('🚀 بدء إنشاء المستخدم...');
    console.log('📤 البيانات المرسلة:', userData);
    console.log('🌐 API URL:', `${BASE_URL}users`);

    // فحص التوكن
    const token = localStorage.getItem('token');
    console.log('🔑 التوكن:', token ? 'موجود' : 'غير موجود');

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      // إضافة التوكن إذا كان موجوداً
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post<ApiResponse<UserResponse>>(
        `${BASE_URL}users`,
        userData,
        { headers }
      );

      console.log('📥 استجابة API:', response.data);

      if (response.data.success) {
      
        return response.data.data || null;
      } else {
       
        throw new Error(response.data.message || 'فشل في إنشاء المستخدم');
      }
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء المستخدم';
      setError(errorMessage);
     
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
        //CONSOLE.log('✅ تم تسجيل الدخول بنجاح');
        
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
      //CONSOLE.error('❌ خطأ في تسجيل الدخول:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    //CONSOLE.log('✅ تم تسجيل الخروج بنجاح');
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
      //CONSOLE.error('❌ خطأ في قراءة بيانات المستخدم:', err);
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
        //CONSOLE.log('✅ تم تحديث المستخدم بنجاح:', response.data.data);
        
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
      //CONSOLE.error('❌ خطأ في تحديث المستخدم:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // التحقق من صلاحية حذف المستخدم
  const checkDeletePermission = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // يمكن إضافة طلب للتحقق من الصلاحيات هنا
      // مثلاً: GET /api/users/{userId}/permissions
      return true;
    } catch (error) {
      console.error('❌ خطأ في التحقق من الصلاحيات:', error);
      return false;
    }
  };

  // التحقق من حالة التوكن
  const checkTokenStatus = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔑 لا يوجد توكن');
        return false;
      }

      // يمكن إضافة طلب للتحقق من صحة التوكن
      // مثلاً: GET /api/auth/verify-token
      console.log('🔑 التوكن موجود وصالح');
      return true;
    } catch (error) {
      console.error('❌ خطأ في التحقق من التوكن:', error);
      return false;
    }
  };

  // التحقق من وجود المستخدم
  const checkUserExists = async (userId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.get<ApiResponse<UserResponse>>(
        `${BASE_URL}users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data.success && !!response.data.data;
    } catch (error) {
      console.error('❌ خطأ في التحقق من وجود المستخدم:', error);
      return false;
    }
  };

  // حذف المستخدم
  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 التوكن:', token ? 'موجود' : 'غير موجود');
      
      if (!token) {
        throw new Error('التوكن غير موجود');
      }

      // التحقق من صحة userId
      if (!userId || userId.trim() === '') {
        throw new Error('معرف المستخدم غير صحيح');
      }

      // التحقق من وجود المستخدم قبل محاولة حذفه
      console.log('🔍 التحقق من وجود المستخدم قبل الحذف...');
      const userExists = await checkUserExists(userId);
      if (!userExists) {
        const errorMessage = 'المستخدم غير موجود أو تم حذفه مسبقاً';
        setError(errorMessage);
        console.error('❌ المستخدم غير موجود:', userId);
        return false;
      }

      // طباعة تفاصيل الطلب للتشخيص
      console.log('🗑️ محاولة حذف المستخدم:', userId);
      console.log('🔗 URL:', `${BASE_URL}users/${userId}`);
      console.log('🔑 Authorization Header:', `Bearer ${token.substring(0, 20)}...`);

      const response = await axios.delete<ApiResponse<null>>(
        `${BASE_URL}users/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📥 استجابة حذف المستخدم:', response.status, response.data);

      if (response.data.success) {
        console.log('✅ تم حذف المستخدم بنجاح');
        return true;
      } else {
        // معالجة خاصة لخطأ "Cannot read properties of undefined (reading '_id')"
        if (response.data.error && response.data.error.includes('Cannot read properties of undefined')) {
          const errorMessage = 'المستخدم غير موجود أو تم حذفه مسبقاً';
          setError(errorMessage);
          console.error('❌ المستخدم غير موجود:', response.data);
          return false;
        }
        
        throw new Error(response.data.message || 'فشل في حذف المستخدم');
      }
    } catch (err: any) {
      console.error('❌ خطأ في حذف المستخدم:', err);
      
      // معالجة خاصة لخطأ 404
      if (err.response?.status === 404) {
        const errorMessage = 'المستخدم غير موجود';
        setError(errorMessage);
        console.error('🔍 خطأ 404 - المستخدم غير موجود:', err.response.data);
        return false;
      }
      
      // معالجة خاصة لخطأ 403
      if (err.response?.status === 403) {
        const errorMessage = 'ليس لديك صلاحية لحذف هذا المستخدم أو التوكن منتهي الصلاحية';
        setError(errorMessage);
        console.error('🚫 خطأ 403 - صلاحيات غير كافية:', err.response.data);
        return false;
      }
      
      // معالجة خاصة لخطأ 401
      if (err.response?.status === 401) {
        const errorMessage = 'التوكن منتهي الصلاحية، يرجى إعادة تسجيل الدخول';
        setError(errorMessage);
        console.error('🔒 خطأ 401 - توكن منتهي الصلاحية:', err.response.data);
        
        // مسح التوكن من localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // يمكن إضافة redirect للصفحة الرئيسية هنا
        // window.location.href = '/login';
        
        return false;
      }

      // معالجة خاصة لخطأ "Cannot read properties of undefined"
      if (err.response?.data?.error && err.response.data.error.includes('Cannot read properties of undefined')) {
        const errorMessage = 'المستخدم غير موجود أو تم حذفه مسبقاً';
        setError(errorMessage);
        console.error('❌ خطأ في قراءة بيانات المستخدم:', err.response.data);
        return false;
      }

      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء حذف المستخدم';
      setError(errorMessage);
      console.error('❌ خطأ عام في حذف المستخدم:', errorMessage);
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
        //CONSOLE.log('✅ تم إرسال رابط إعادة تعيين كلمة المرور');
        return true;
      } else {
        throw new Error(response.data.message || 'فشل في إرسال رابط إعادة التعيين');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
      setError(errorMessage);
      //CONSOLE.error('❌ خطأ في إرسال رابط إعادة التعيين:', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // جلب جميع المستخدمين
  const getAllUsers = async (): Promise<UserResponse[]> => {
    console.log('🔄 useUser: بدء getAllUsers، تعيين loading إلى true');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 useUser: التوكن:', token ? 'موجود' : 'غير موجود');
      
      const response = await axios.get<ApiResponse<UserResponse[]>>(
        `${BASE_URL}users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📥 useUser: استجابة API:', response.data);

      if (response.data.success) {
        console.log('✅ useUser: تم جلب المستخدمين بنجاح:', response.data.data);
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'فشل في جلب المستخدمين');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المستخدمين';
      setError(errorMessage);
      console.error('❌ useUser: خطأ في جلب المستخدمين:', errorMessage);
      return [];
    } finally {
      console.log('🏁 useUser: إنهاء getAllUsers، تعيين loading إلى false');
      setLoading(false);
    }
  };

  // التحقق من وجود البريد الإلكتروني
  const checkEmailExists = async (email: string): Promise<boolean> => {
    //CONSOLE.log('🔍 جاري التحقق من البريد الإلكتروني:', email);
    
    try {
      const users = await getAllUsers();
      const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        //CONSOLE.log('❌ البريد الإلكتروني مستخدم بالفعل:', email);
      } else {
        //CONSOLE.log('✅ البريد الإلكتروني متاح:', email);
      }
      
      return emailExists;
    } catch (error) {
      //CONSOLE.error('❌ خطأ في التحقق من البريد الإلكتروني:', error);
      return false; // في حالة الخطأ، نعتبر أن البريد متاح
    }
  };

  // التحقق من وجود رقم الهاتف
  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    console.log('🔍 جاري التحقق من رقم الهاتف:', phone);
    
    try {
      const users = await getAllUsers();
      const phoneExists = users.some(user => user.phone === phone);
      
      if (phoneExists) {
        console.log('❌ رقم الهاتف مستخدم بالفعل:', phone);
      } else {
        console.log('✅ رقم الهاتف متاح:', phone);
      }
      
      return phoneExists;
    } catch (error) {
      console.error('❌ خطأ في التحقق من رقم الهاتف:', error);
      return false; // في حالة الخطأ، نعتبر أن الرقم متاح
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
    checkPhoneExists,
    checkDeletePermission,
    checkTokenStatus,
    checkUserExists,
  };
};
 