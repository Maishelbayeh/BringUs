import { useState } from 'react';
import { BASE_URL, LOGIN } from '../constants/api';
import { updateUserData, updateStoreData, updateStoreId } from './useLocalStorage';
import { useStore } from './useStore';

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  storeId: string;
  userStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    
    avatar: {
      public_id: string | null;
      url: string;
    };
    store: {
      id: string;
      nameAr: string;
      nameEn: string;
      slug: string;
      status: string;
      isPrimaryOwner: boolean;
      isOwner: boolean;
      permissions: string[];
      _id: string;
    };
    stores: Array<{
      id: string;
      nameAr: string;
      nameEn: string;
      slug: string;
      status: string;
      isPrimaryOwner: boolean;
      isOwner: boolean;
      permissions: string[];
    }>;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getStore } = useStore();
// -----------------------------------------------login---------------------------------------------------------
  const login = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}${LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تسجيل الدخول');
      }

      if (data.success && data.user.role === 'admin' && data.userStatus === 'active') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isOwner', data.user.store.isOwner.toString());
        if (data.user.store?.id) {
          updateStoreId(data.storeId);
        
        }

        
        updateUserData(data.user);
        if (data.user.store) {
          updateStoreData(data.user.store);
        }
        
       
        if (data.user.store?.id) {
          try {
            const fullStoreData = await getStore(data.user.store.id);
            if (fullStoreData) {
             updateStoreData(fullStoreData);
            }
          } catch (error) {
            //CONSOLE.error('❌ خطأ في جلب بيانات المتجر الكاملة:', error);
          }
        }
        
        //CONSOLE.log('✅ تم تسجيل الدخول بنجاح:', data.user);
        return data;
      } else {
        throw new Error(data.message || 'فشل في تسجيل الدخول');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      //CONSOLE.error('❌ خطأ في تسجيل الدخول:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
// -----------------------------------------------logout---------------------------------------------------------
  const logout = () => {
   
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeInfo');
    localStorage.removeItem('storeLogo');
    updateStoreId("");
  };
// -----------------------------------------------getCurrentUser---------------------------------------------------------
  const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  };
// -----------------------------------------------getToken---------------------------------------------------------
  const getToken = () => {
    return localStorage.getItem('token');
  };
// -----------------------------------------------isAuthenticated---------------------------------------------------------
  const isAuthenticated = () => {
    return !!getToken();
  };
// -----------------------------------------------isAdmin---------------------------------------------------------

  const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
  };
// -----------------------------------------------isAuthenticatedAdmin---------------------------------------------------------
  const isAuthenticatedAdmin = () => {
    return isAuthenticated() && isAdmin();
  };
// -----------------------------------------------return---------------------------------------------------------
  return {
    login,
    logout,
    getCurrentUser,
    getToken,
    isAuthenticated,
    isAdmin,
    isAuthenticatedAdmin,
    isLoading,
    error,
  };
}; 