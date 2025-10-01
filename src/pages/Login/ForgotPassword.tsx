import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language} = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set document direction when language changes
  useEffect(() => {
    document.dir = language === 'ARABIC' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ARABIC' ? 'ar' : 'en';
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(t('login.auth.forgot_password.validation.email_required'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('login.auth.forgot_password.validation.email_invalid'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_BASE_URL = 'https://bringus-backend.onrender.com/api';
      
      // Get base URL from current window location
      let baseUrl = `${window.location.protocol}//${window.location.host}`;
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Current window location:', {
          protocol: window.location.protocol,
          host: window.location.host,
          href: window.location.href,
          baseUrl: baseUrl
        });
      }
      
      const requestBody = { 
        email,
        baseUrl
      };
      
      console.log('Sending forgot password request:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/password-reset/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('login.auth.forgot_password.success_message'));
        setIsSubmitted(true);
      } else {
        setError(data.message || t('login.auth.forgot_password.error_generic'));
      }
    } catch (err) {
      console.error('Forgot password error:', err);
        setError(t('login.auth.forgot_password.error_network'));
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
              {t('login.auth.forgot_password.title')}
            </h1>
            <p className="text-gray-600">
              {t('login.auth.forgot_password.subtitle')}
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
              {t('login.auth.forgot_password.back_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {t('login.auth.forgot_password.title')}
          </h1>
          <p className="text-gray-600">
            {t('login.auth.forgot_password.subtitle')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <CustomInput
              label={t('login.auth.forgot_password.email')}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.auth.forgot_password.email_placeholder')}
              disabled={loading}
            />
          </div>
         
          <CustomButton
            text={loading ? t('login.auth.forgot_password.sending') : t('login.auth.forgot_password.send')}
            type="submit"
            disabled={loading}
            className="w-full bg-primary"
          />
        </form>
        
        <div className="text-center mt-6">
          <span className="text-gray-600">{t('login.auth.forgot_password.remember_password')}</span>
          <button 
            onClick={handleBackToLogin} 
            className="text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors duration-200"
          >
            {t('login.auth.forgot_password.back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;