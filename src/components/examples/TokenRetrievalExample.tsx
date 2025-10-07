import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthToken, isAuthenticated, getUserInfo } from '../../utils/authUtils';

/**
 * Example component demonstrating token retrieval from both localStorage and sessionStorage
 */
const TokenRetrievalExample: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    // Check authentication status and token info
    const checkAuthStatus = () => {
      const token = getAuthToken();
      const userInfo = getUserInfo();
      const isAuth = isAuthenticated();
      
      setTokenInfo({
        token,
        userInfo,
        isAuthenticated: isAuth,
        localStorageToken: localStorage.getItem('token'),
        sessionStorageToken: sessionStorage.getItem('token'),
        localStorageUserInfo: localStorage.getItem('userInfo'),
        sessionStorageUserInfo: sessionStorage.getItem('userInfo')
      });
    };

    checkAuthStatus();
    
    // Check every 2 seconds for changes
    const interval = setInterval(checkAuthStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'مثال على استرجاع التوكن' : 'Token Retrieval Example'}
      </h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            {isRTL ? 'حالة المصادقة:' : 'Authentication Status:'}
          </h3>
          <p className="text-sm">
            <span className="font-medium">{isRTL ? 'مصادق:' : 'Authenticated:'}</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              tokenInfo?.isAuthenticated 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tokenInfo?.isAuthenticated ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}
            </span>
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'التوكن المسترجع:' : 'Retrieved Token:'}
          </h3>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
            {tokenInfo?.token ? 
              `${tokenInfo.token.substring(0, 20)}...` : 
              (isRTL ? 'لا يوجد توكن' : 'No token found')
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">
              {isRTL ? 'localStorage:' : 'localStorage:'}
            </h4>
            <div className="text-xs space-y-1">
              <p>
                <span className="font-medium">{isRTL ? 'التوكن:' : 'Token:'}</span> 
                {tokenInfo?.localStorageToken ? '✅' : '❌'}
              </p>
              <p>
                <span className="font-medium">{isRTL ? 'معلومات المستخدم:' : 'User Info:'}</span> 
                {tokenInfo?.localStorageUserInfo ? '✅' : '❌'}
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">
              {isRTL ? 'sessionStorage:' : 'sessionStorage:'}
            </h4>
            <div className="text-xs space-y-1">
              <p>
                <span className="font-medium">{isRTL ? 'التوكن:' : 'Token:'}</span> 
                {tokenInfo?.sessionStorageToken ? '✅' : '❌'}
              </p>
              <p>
                <span className="font-medium">{isRTL ? 'معلومات المستخدم:' : 'User Info:'}</span> 
                {tokenInfo?.sessionStorageUserInfo ? '✅' : '❌'}
              </p>
            </div>
          </div>
        </div>

        {tokenInfo?.userInfo && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">
              {isRTL ? 'معلومات المستخدم:' : 'User Information:'}
            </h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">{isRTL ? 'الاسم:' : 'Name:'}</span> {tokenInfo.userInfo.firstName} {tokenInfo.userInfo.lastName}</p>
              <p><span className="font-medium">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span> {tokenInfo.userInfo.email}</p>
              <p><span className="font-medium">{isRTL ? 'الدور:' : 'Role:'}</span> {tokenInfo.userInfo.role}</p>
            </div>
          </div>
        )}

        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
          <h4 className="font-medium text-gray-800 mb-2">
            {isRTL ? 'كيف يعمل:' : 'How it works:'}
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• {isRTL ? 'يتم البحث عن التوكن في localStorage أولاً' : 'Searches for token in localStorage first'}</p>
            <p>• {isRTL ? 'إذا لم يوجد، يبحث في sessionStorage' : 'If not found, searches in sessionStorage'}</p>
            <p>• {isRTL ? 'يعيد التوكن الأول الذي يجده' : 'Returns the first token found'}</p>
            <p>• {isRTL ? 'يعيد null إذا لم يوجد توكن في أي مكان' : 'Returns null if no token found anywhere'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenRetrievalExample;

