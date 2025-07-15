import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Visibility, 
  VisibilityOff, 

  CheckCircle,
  Language,
  Security,
  Support,
  TrendingUp,
  Speed,
  Check,
  Store
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';
import StoreRegistrationWizard from '../../pages/store/StoreRegistrationWizard';
const Signup: React.FC = () => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{ 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    phone?: string; 
    terms?: string; 
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showStoreWizard, setShowStoreWizard] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Real-time password confirmation validation
    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: t('signup.passwordsNotMatch') }));
      } else if (value && value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
    
    // Real-time password validation for confirm password field
    if (name === 'password') {
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: t('signup.passwordsNotMatch') }));
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = t('signup.firstNameRequired');
    }
    
    if (!formData.lastName) {
      newErrors.lastName = t('signup.lastNameRequired');
    }
    
    if (!formData.email) {
      newErrors.email = t('signup.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('signup.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('signup.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('signup.passwordMinLength');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.passwordsNotMatch');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('signup.phoneRequired');
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('signup.phoneInvalid');
    }
    
    if (!agreeTerms) {
      newErrors.terms = t('signup.termsRequired');
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
      
      // Navigate to dashboard on success
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Speed className="text-4xl text-green-500" />,
      title: t('signup.features.easySetup'),
      description: t('signup.features.easySetupDesc')
    },
    {
      icon: <Security className="text-4xl text-blue-500" />,
      title: t('signup.features.securePlatform'),
      description: t('signup.features.securePlatformDesc')
    },
    {
      icon: <Support className="text-4xl text-purple-500" />,
      title: t('signup.features.24Support'),
      description: t('signup.features.24SupportDesc')
    },
    {
      icon: <TrendingUp className="text-4xl text-orange-500" />,
      title: t('signup.features.analytics'),
      description: t('signup.features.analyticsDesc')
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
                {t('signup.welcomeTitle')}
              </h1>
              <p className={`text-lg text-gray-600 leading-relaxed ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('signup.welcomeSubtitle')}
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

        {/* Right Side - Signup Form */}
        <div className={`${language === 'ARABIC' ? 'order-1' : 'order-2'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white text-2xl" />
              </div>
              <h2 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('signup.signUp')}
              </h2>
              <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('signup.signUpSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <CustomInput
                    label={t('signup.firstName')}
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('signup.firstNamePlaceholder')}
                    error={errors.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <CustomInput
                    label={t('signup.lastName')}
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('signup.lastNamePlaceholder')}
                    error={errors.lastName}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <CustomInput
                  label={t('signup.email')}
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('signup.emailPlaceholder')}
                  error={errors.email}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <CustomInput
                  label={t('signup.phone')}
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('signup.phonePlaceholder')}
                  error={errors.phone}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <label htmlFor="password" className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('signup.password')}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t('signup.passwordPlaceholder')}
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
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="mt-1 text-xs text-red-600 block">{errors.password}</span>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="relative">
                  <label htmlFor="confirmPassword" className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('signup.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t('signup.confirmPasswordPlaceholder')}
                      className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
                          bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary
                          ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      style={{ 
                        direction: language === 'ARABIC' ? 'rtl' : 'ltr',
                        textAlign: language === 'ARABIC' ? 'right' : 'left'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${language === 'ARABIC' ? 'left-3' : 'right-3'}`}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                    {/* Green check icon when passwords match */}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                      <div className={`absolute top-1/2 transform -translate-y-1/2 ${language === 'ARABIC' ? 'right-12' : 'left-12'}`}>
                        <Check className="text-green-500 text-lg" />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <span className="mt-1 text-xs text-red-600 block">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <label className={`flex items-start ${language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={`w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-1 ${language === 'ARABIC' ? 'ml-2' : 'mr-2'}`}
                  />
                  <span className={`text-sm text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {t('signup.agreeTerms')}
                  </span>
                </label>
                {errors.terms && (
                  <span className={`mt-1 text-xs text-red-600 block ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>{errors.terms}</span>
                )}
              </div>

              <CustomButton
                text={isLoading ? t('signup.creatingAccount') : t('signup.signUp')}
                color="purple"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                icon={isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : <CheckCircle />}
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('signup.or')}</span>
                </div>
              </div>

              {/* Store Registration Button */}
              <CustomButton
                text={t('signup.registerStore')}
                color="white"
                textColor="purple"
                action={() => setShowStoreWizard(true)}
                className="w-full py-3 text-base font-semibold border-2 border-purple-600 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200"
                icon={<Store />}
              />

              <div className="text-center">
                <span className="text-gray-600">
                  {t('signup.haveAccount')}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                  {t('signup.signIn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Store Registration Wizard Modal */}
      <StoreRegistrationWizard
        isOpen={showStoreWizard}
        onClose={() => setShowStoreWizard(false)}
      />
    </div>
  );
};

export default Signup; 