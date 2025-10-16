import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Visibility, 
  VisibilityOff, 

  Login as LoginIcon,
  ShoppingCart,
  TrendingUp,
  People,
  Assessment,
  Language
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useStoreUrls } from '@/hooks/useStoreUrls';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookies';


const Login: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const { login, isLoading: authLoading, error: authError, isEmailNotVerified } = useAuth();
  const { storeSlug: _storeSlug } = useStoreUrls();
  const [formData, setFormData] = useState(() => {
    // Load saved credentials from cookies or localStorage
    const savedEmail = getCookie('savedEmail') || localStorage.getItem('savedEmail');
    const savedPassword = getCookie('savedPassword') || localStorage.getItem('savedPassword');
    const rememberMeFlag = getCookie('rememberMe') || localStorage.getItem('rememberMe');
    
    console.log('Loading saved credentials:', {
      savedEmail,
      savedPassword: savedPassword ? '***' : null,
      rememberMeFlag,
      source: getCookie('rememberMe') ? 'cookies' : 'localStorage'
    });
    
    return {
      email: savedEmail || '',
      password: savedPassword || ''
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Check cookies first, then localStorage
    const cookieRemember = getCookie('rememberMe') === 'true';
    const localRemember = localStorage.getItem('rememberMe') === 'true';
    const isRemembered = cookieRemember || localRemember;
    console.log('Remember Me state loaded:', isRemembered, 'from', cookieRemember ? 'cookies' : 'localStorage');
    return isRemembered;
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = t('login.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('login.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('login.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.passwordMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        panelType: "admin",
        rememberMe: rememberMe
      });
      
      // Save credentials if rememberMe is checked
      if (rememberMe) {
        // حفظ البيانات في الكوكيز لمدة 30 يوم
        setCookie('savedEmail', formData.email, { days: 30 });
        setCookie('savedPassword', formData.password, { days: 30 });
        console.log('🍪 Credentials saved to cookies:', {
          email: formData.email,
          password: '***',
          rememberMe: true
        });
      } else {
        // Clear saved credentials from both cookies and localStorage
        deleteCookie('savedEmail');
        deleteCookie('savedPassword');
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
        console.log('Credentials cleared from cookies and localStorage');
      }
      localStorage.setItem('userId', result?.user.id || '');
      localStorage.setItem('storeId', result?.storeId || '');
      localStorage.setItem('userName', result?.user.firstName || '');
      localStorage.setItem('email', result?.user.email || '');
      localStorage.setItem('storeNameAr', result?.user?.store?.nameAr || '');
      localStorage.setItem('storeNameEn', result?.user?.store?.nameEn || '');
      localStorage.setItem('userLastName', result?.user.lastName || '');
      localStorage.setItem('status', result?.user?.store?.status || '');
      localStorage.setItem('UserPhone', result?.user.phone || '');

      const storeslug=result?.user?.store?.slug;
      if (result) {
        // التحقق من دور المستخدم والتوجيه المناسب
        const user = result.user;
        if (user.role === 'superadmin') {
          // السوبر أدمن يذهب مباشرة إلى إدارة المتاجر
          navigate(`/${storeslug}/superadmin/stores`);
        } else {
        
          navigate(`/${storeslug}/`);
        }
      }
    } catch (error) {
      //CONSOLE.error('Login error:', error);
    }
  };

  const features = [
    {
      icon: <ShoppingCart className="text-4xl text-purple-500" />,
      title: t('login.features.orders'),
      description: t('login.features.ordersDesc')
    },
    {
      icon: <TrendingUp className="text-4xl text-green-500" />,
      title: t('login.features.analytics'),
      description: t('login.features.analyticsDesc')
    },
    {
      icon: <People className="text-4xl text-blue-500" />,
      title: t('login.features.customers'),
      description: t('login.features.customersDesc')
    },
    {
      icon: <Assessment className="text-4xl text-orange-500" />,
      title: t('login.features.reports'),
      description: t('login.features.reportsDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative">
      {/* Language Toggle Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Language className="text-purple-600" />
          <span className="font-semibold text-gray-700">
            {language === 'ARABIC' ? 'EN' : 'عربي'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Features */}
        <div className={`hidden lg:block ${language === 'ARABIC' ? 'order-2' : 'order-1'}`}>
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <h1 className={`text-4xl font-bold text-gray-800 mb-4 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('login.welcomeTitle')}
              </h1>
              <p className={`text-lg text-gray-600 leading-relaxed ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('login.welcomeSubtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-white rounded-full shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={`${language === 'ARABIC' ? 'order-1' : 'order-2'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LoginIcon className="text-white text-2xl" />
              </div>
              <h2 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('login.signIn')}
              </h2>
              <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('login.signInSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              
              <div className="space-y-2">
                <CustomInput
                  label={t('login.email')}
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('login.emailPlaceholder')}
                  error={errors.email}
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <label htmlFor="password" className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t('login.passwordPlaceholder')}
                      className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
                          bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary
                          ${errors.password ? 'border-red-500' : ''}`}
                      style={{ 
                        direction: language === 'ARABIC' ? 'rtl' : 'ltr',
                        textAlign: language === 'ARABIC' ? 'right' : 'left'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${language === 'ARABIC' ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <Visibility /> :<VisibilityOff />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="mt-1 text-xs text-red-600 block">{errors.password}</span>
                  )}
                </div>
              </div>
  {/* عرض رسائل الخطأ العامة */}
  {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" dir={language === 'ARABIC' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center justify-between">
                    <span>{authError}</span>
                    {isEmailNotVerified && (
                      <button
                        type="button"
                        onClick={() => navigate(`/email-verification?email=${encodeURIComponent(formData.email)}`)}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        {t('login.verifyEmail')}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className={`flex items-center justify-between ${language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`} >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {t('login.rememberMe')}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate(`/forgot-password`)}
                  className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <CustomButton
                text={authLoading ? t('login.signingIn') : t('login.signIn')}
                color="purple"
                type="submit"
                disabled={authLoading}
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                icon={authLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : <LoginIcon />}
              />

              <div className="text-center">
                <span className="text-gray-600">
                  {t('login.noAccount')}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                  {t('login.signUp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 