import { useState } from 'react';
import { BASE_URL, LOGIN } from '../constants/api';
import { updateUserData, updateStoreData, updateStoreId } from './useLocalStorage';
import { saveAuthToken, saveUserInfo, saveStoreId, getAuthToken } from '../utils/authUtils';
import { setCookie, getCookie, deleteCookie, setCookieObject, getCookieObject } from '../utils/cookies';
import i18n from 'i18next';
import useLanguage from './useLanguage';
interface LoginResponse {
  success: boolean;
  message: string;
  messageAr?: string;
  token: string;
  storeId: string;
  userStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
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
  rememberMe?: boolean;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  useLanguage();
// -----------------------------------------------login---------------------------------------------------------
  const login = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    setIsEmailNotVerified(false);

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
        const errorMessage = i18n.language === 'ARABIC' && data.messageAr 
          ? data.messageAr 
          : data.message || 'فشل في تسجيل الدخول';
        throw new Error(errorMessage);
      }

      if (data.success && data.userStatus === 'active') {
        // ✅ حفظ التوكن في localStorage دائماً (جميع الـ APIs تعتمد عليه)
        saveAuthToken(data.token);
        saveUserInfo(data.user);
        
        if (credentials.rememberMe) {
          // حفظ إضافي في الكوكيز - يبقى لمدة 30 يوم
          setCookie('token', data.token, { days: 30 });
          setCookieObject('userInfo', data.user, { days: 30 });
          setCookie('rememberMe', 'true', { days: 30 });
          localStorage.setItem('rememberMe', 'true');
          console.log('✅ Token saved to localStorage + 🍪 Cookies (persistent - 30 days)');
        } else {
          // حذف الكوكيز إذا كان "تذكرني" غير مفعّل
          deleteCookie('token');
          deleteCookie('userInfo');
          deleteCookie('rememberMe');
          localStorage.removeItem('rememberMe');
          console.log('✅ Token saved to localStorage only (session will end on browser close)');
        }
        
        // حفظ بيانات المستخدم
        updateUserData(data.user);
        
        // إذا كان المستخدم admin وليس superadmin، احفظ بيانات المتجر
        if (data.user.role === 'admin' && data.user.store) {
          localStorage.setItem('isOwner', data.user.store.isOwner.toString());
          if (data.user.store?.id) {
            saveStoreId(data.storeId);
            updateStoreId(data.storeId);
          }
          
          updateStoreData(data.user.store);
          
          if (data.user.store?.slug) {
            try {
              // جلب بيانات المتجر الكاملة باستخدام fetch مباشرة
              const token = getAuthToken();
              const storeResponse = await fetch(`${BASE_URL}stores/slug/${data.user.store.slug}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (storeResponse.ok) {
                const storeData = await storeResponse.json();
                if (storeData.success && storeData.data) {
                  updateStoreData(storeData.data);
                }
              }
            } catch (error) {
              //CONSOLE.error('❌ خطأ في جلب بيانات المتجر الكاملة:', error);
            }
          }
        } else if (data.user.role === 'superadmin') {
          // السوبر أدمن لا يملك متجر
          localStorage.setItem('isOwner', 'false');
        }
        
        // Dispatch custom event for store context update
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: data.user, store: data.user.store } 
        }));
        
        //CONSOLE.log('✅ تم تسجيل الدخول بنجاح:', data.user);
        return data;
      } else {
        const errorMessage = i18n.language === 'ARABIC' && data.messageAr 
          ? data.messageAr 
          : data.message || 'فشل في تسجيل الدخول';
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      
      // Check if the error is about email not being verified
      if (errorMessage.includes('Email is not verified') || errorMessage.includes('البريد الإلكتروني غير مؤكد')) {
        setIsEmailNotVerified(true);
      }
      
      //CONSOLE.error('❌ خطأ في تسجيل الدخول:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
// -----------------------------------------------logout---------------------------------------------------------
  const logout = () => {
    // Clear localStorage (except savedEmail and savedPassword for "Remember Me")
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('storeId');
    localStorage.removeItem('storeInfo');
    localStorage.removeItem('storeLogo');
    localStorage.removeItem('isOwner');
    // NOTE: لا نحذف savedEmail و savedPassword و rememberMe حتى يبقوا محفوظين لـ "تذكرني"
    // localStorage.removeItem('savedEmail');
    // localStorage.removeItem('savedPassword');
    // localStorage.removeItem('rememberMe');
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    
    // Clear cookies (except savedEmail and savedPassword for "Remember Me")
    deleteCookie('token');
    deleteCookie('userInfo');
    // NOTE: لا نحذف savedEmail و savedPassword و rememberMe حتى يبقوا محفوظين لـ "تذكرني"
    // deleteCookie('savedEmail');
    // deleteCookie('savedPassword');
    // deleteCookie('rememberMe');
    console.log('🗑️ Authentication data cleared (keeping savedEmail & savedPassword for Remember Me)');
    
    updateStoreId("");
    
    // Dispatch custom event for store context update
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  };

// -----------------------------------------------clearRememberMe---------------------------------------------------------
  // دالة لحذف بيانات "تذكرني" بشكل كامل (يمكن استخدامها من زر "نسيان البيانات المحفوظة")
  const clearRememberMe = () => {
    // Clear from localStorage
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    localStorage.removeItem('rememberMe');
    
    // Clear from cookies
    deleteCookie('savedEmail');
    deleteCookie('savedPassword');
    deleteCookie('rememberMe');
    
    console.log('🗑️ Remember Me data cleared completely');
  };
// -----------------------------------------------getCurrentUser---------------------------------------------------------
  const getCurrentUser = () => {
    // Check localStorage first (always saved there), then cookies as fallback
    const localUserInfo = localStorage.getItem('userInfo');
    if (localUserInfo) {
      return JSON.parse(localUserInfo);
    }
    
    const cookieUserInfo = getCookieObject('userInfo');
    if (cookieUserInfo) {
      return cookieUserInfo;
    }
    
    const sessionUserInfo = sessionStorage.getItem('userInfo');
    if (sessionUserInfo) {
      return JSON.parse(sessionUserInfo);
    }
    
    return null;
  };
// -----------------------------------------------getToken---------------------------------------------------------
  const getToken = () => {
    // Check localStorage first (always saved there), then cookies as fallback
    const localToken = localStorage.getItem('token');
    if (localToken) {
      return localToken;
    }
    
    const cookieToken = getCookie('token');
    if (cookieToken) {
      return cookieToken;
    }
    
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      return sessionToken;
    }
    
    return null;
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
// -----------------------------------------------isSuperAdmin---------------------------------------------------------
  const isSuperAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'superadmin';
  };
// -----------------------------------------------isAuthenticatedSuperAdmin---------------------------------------------------------
  const isAuthenticatedSuperAdmin = () => {
    return isAuthenticated() && isSuperAdmin();
  };
// -----------------------------------------------return---------------------------------------------------------
  return {
    login,
    logout,
    clearRememberMe,
    getCurrentUser,
    getToken,
    isAuthenticated,
    isAdmin,
    isAuthenticatedAdmin,
    isSuperAdmin,
    isAuthenticatedSuperAdmin,
    isLoading,
    error,
    isEmailNotVerified,
  };
}; 