import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Email, 
  Language,
  Security,
  Speed,
  Support,
  Shield,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = t('forgotPassword.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('forgotPassword.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Security className="text-4xl text-blue-500" />,
      title: t('forgotPassword.features.secureReset'),
      description: t('forgotPassword.features.secureResetDesc')
    },
    {
      icon: <Speed className="text-4xl text-green-500" />,
      title: t('forgotPassword.features.quickProcess'),
      description: t('forgotPassword.features.quickProcessDesc')
    },
    {
      icon: <Support className="text-4xl text-purple-500" />,
      title: t('forgotPassword.features.emailSupport'),
      description: t('forgotPassword.features.emailSupportDesc')
    },
    {
      icon: <Shield className="text-4xl text-orange-500" />,
      title: t('forgotPassword.features.accountProtection'),
      description: t('forgotPassword.features.accountProtectionDesc')
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
                {t('forgotPassword.welcomeTitle')}
              </h1>
              <p className={`text-lg text-gray-600 leading-relaxed ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('forgotPassword.welcomeSubtitle')}
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

        {/* Right Side - Forgot Password Form */}
        <div className={`${language === 'ARABIC' ? 'order-1' : 'order-2'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Email className="text-white text-2xl" />
              </div>
              <h2 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('forgotPassword.resetPassword')}
              </h2>
              <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('forgotPassword.resetPasswordSubtitle')}
              </p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <CustomInput
                    label={t('forgotPassword.email')}
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    error={errors.email}
                  />
                </div>

                <CustomButton
                  text={isLoading ? t('forgotPassword.sendingLink') : t('forgotPassword.sendResetLink')}
                  color="purple"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-base font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200"
                  icon={isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : <Email />}
                />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors mx-auto"
                  >
                    <ArrowBack className="text-lg" />
                    {t('forgotPassword.backToLogin')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('forgotPassword.resetLinkSent')}
                  </h3>
                  <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('forgotPassword.checkEmail')}
                  </p>
                </div>
                <CustomButton
                  text={t('forgotPassword.backToLogin')}
                  color="purple"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                  icon={<ArrowBack />}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 