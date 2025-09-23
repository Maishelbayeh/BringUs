import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowBack,
  Language,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import CustomButton from '@/components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get token from URL search params
  const token = searchParams.get('token');

  // Set document direction when language changes
  useEffect(() => {
    document.dir = language === 'ARABIC' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ARABIC' ? 'ar' : 'en';
  }, [language]);

  // Validation function
  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = t('login.auth.reset_password.validation.password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.auth.reset_password.validation.password_min_length');
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('login.auth.reset_password.validation.confirm_password_required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('login.auth.reset_password.validation.passwords_not_match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError(t('login.auth.reset_password.error_no_token'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE_URL = 'http://localhost:5001/api';
      
      // Get base URL from current window location
      let baseUrl = `${window.location.protocol}//${window.location.host}`;
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Reset password request:', {
          token,
          baseUrl
        });
      }
      
      const requestBody = { 
        token,
        newPassword: formData.password,
      };
      
      const response = await fetch(`${API_BASE_URL}/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('login.auth.reset_password.success_message'));
        setIsSubmitted(true);
      } else {
        setError(data.message || t('login.auth.reset_password.error_generic'));
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(t('login.auth.reset_password.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Language Switcher */}
        {/* <button
          onClick={toggleLanguage}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <Language className="w-5 h-5" />
          {language === 'ARABIC' ? 'English' : 'العربية'}
        </button> */}

        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('login.auth.reset_password.title')}
            </h1>
            <p className="text-gray-600">
              {t('login.auth.reset_password.subtitle')}
            </p>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg">{message}</p>
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleBackToLogin} 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              {t('login.auth.reset_password.back_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <Language className="w-5 h-5" />
        {language === 'ARABIC' ? 'English' : 'العربية'}
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowBack className={`w-5 h-5 ${language === 'ARABIC' ? 'rotate-180' : ''}`} />
          {t('general.back')}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('login.auth.reset_password.title')}
          </h1>
          <p className="text-gray-600">
            {t('login.auth.reset_password.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.auth.reset_password.new_password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={t('login.auth.reset_password.new_password_placeholder')}
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute  top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${language === 'ARABIC' ?'left-3'  :'right-3' }`}
              >
                {showPassword ? <VisibilityOff className="w-5 h-5" /> : <Visibility className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.auth.reset_password.confirm_password')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={t('login.auth.reset_password.confirm_password_placeholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute  top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${language === 'ARABIC' ?'left-3'  :'right-3' }`}
              >
                {showConfirmPassword ? <VisibilityOff className="w-5 h-5" /> : <Visibility className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <CustomButton
            text={loading ? t('login.auth.reset_password.resetting') : t('login.auth.reset_password.reset')}
            type="submit"
            disabled={loading}
            className="w-full bg-primary"
          />
        </form>
        
        <div className="text-center mt-6">
          <span className="text-gray-600">{t('login.auth.reset_password.remember_password')}</span>
          <button 
            onClick={handleBackToLogin} 
            className="text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors duration-200"
          >
            {t('login.auth.reset_password.back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
