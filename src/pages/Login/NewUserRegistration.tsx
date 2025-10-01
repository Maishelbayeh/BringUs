import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Visibility, 
  VisibilityOff, 
  Check,
  PersonAdd
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';
import CustomButton from '@/components/common/CustomButton';
import CustomFileInput from '@/components/common/CustomFileInput';
import OTPVerification from '@/components/Auth/OTPVerification';
import useLanguage from '@/hooks/useLanguage';
import { getUserData, getStoreId } from '@/hooks/useLocalStorage';
import { useUser } from '@/hooks/useUser';
import { useToastContext } from '@/contexts/ToastContext';
import useOTP from '@/hooks/useOTP';
import { createImageValidationFunction } from '@/validation/imageValidation';

interface NewUserRegistrationProps {
  onUserCreated?: () => void;
}

const NewUserRegistration: React.FC<NewUserRegistrationProps> = ({ onUserCreated }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // Create image validation function
  const imageValidator = createImageValidationFunction(t);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // إضافة state للأفاتار والعنوان
  const [_avatarFile, setAvatarFile] = useState<File | null>(null);
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
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
  const [showOTP, setShowOTP] = useState(false);
  
  const { createUser, loading: createUserLoading, error: createUserError, checkEmailExists } = useUser();
  const { showSuccess, showError } = useToastContext();
  const { sendOTP } = useOTP();

  // دالة إعادة تعيين الفورم
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    });
    setAddressData({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
    setAvatarFile(null);
    setAgreeTerms(false);
  };

 
  const handleOTPSuccess = () => {
    console.log('✅ تم التحقق من الإيميل بنجاح');
    showSuccess(t('newUser.success'), t('general.success'));
    
    // إعادة تعيين الفورم
    resetForm();
    
   
    if (onUserCreated) {
      onUserCreated();
    } else {
      // إعادة توجيه للصفحة الرئيسية بعد النجاح
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  // معالجة إعادة إرسال OTP
  const handleOTPResend = () => {
    console.log('📧 تم إعادة إرسال OTP');
    showSuccess('Verification code resent successfully', t('general.success'));
  };

  // معالجة العودة من صفحة OTP
  const handleOTPBack = () => {
    setShowOTP(false);
    // setRegistrationData(null);
  };

  // فحص حالة التحميل والأخطاء
  console.log('🔄 حالة التحميل:', createUserLoading);
  console.log('❌ خطأ API:', createUserError);

  // فحص معرف المتجر عند التحميل
  useEffect(() => {
    const storeId = getStoreId();
    console.log('🏪 معرف المتجر عند التحميل:', storeId);
    
    const userData = getUserData();
    console.log('👤 بيانات المستخدم:', userData);
  }, []);

//   useEffect(() => {
//     const currentUser = getUserData();
//     console.log('currentUser', currentUser);
//     if (currentUser.isOwner === 'true') {
//       setUserData(currentUser.info);
//       // التحقق من أن المستخدم مالك
//       const isUserOwner = currentUser.info.isOwner === true || 
//                          (currentUser.info.store && currentUser.info.store.isOwner === true);
//       setIsOwner(isUserOwner);
      
//       if (!isUserOwner) {
//         console.log('User is not owner');
//         navigate('/');
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // التحقق من نوع الحقل
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setAddressData(prev => ({ ...prev, [addressField]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
    
    console.log('🔍 فحص البيانات المدخلة:', formData);
    console.log('🏠 فحص بيانات العنوان:', addressData);
    console.log('✅ الموافقة على الشروط:', agreeTerms);
    
    if (!formData.firstName) {
      newErrors.firstName = t('signup.firstNameRequired');
      console.log('❌ الاسم الأول مطلوب');
    }
    
    if (!formData.lastName) {
      newErrors.lastName = t('signup.lastNameRequired');
      console.log('❌ اسم العائلة مطلوب');
    }
    
    if (!formData.email) {
      newErrors.email = t('signup.emailRequired');
      console.log('❌ البريد الإلكتروني مطلوب');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('signup.emailInvalid');
      console.log('❌ البريد الإلكتروني غير صحيح');
    }
    
    if (!formData.password) {
      newErrors.password = t('signup.passwordRequired');
      console.log('❌ كلمة المرور مطلوبة');
    } else if (formData.password.length < 6) {
      newErrors.password = t('signup.passwordMinLength');
      console.log('❌ كلمة المرور قصيرة جداً');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.confirmPasswordRequired');
      console.log('❌ تأكيد كلمة المرور مطلوب');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.passwordsNotMatch');
      console.log('❌ كلمات المرور غير متطابقة');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('signup.phoneRequired');
      console.log('❌ رقم الهاتف مطلوب');
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('signup.phoneInvalid');
      console.log('❌ رقم الهاتف غير صحيح');
    }
    
    if (!agreeTerms) {
      newErrors.terms = t('signup.termsRequired');
      console.log('❌ الموافقة على الشروط مطلوبة');
    }
    
    console.log('📋 الأخطاء الموجودة:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 بدء عملية إنشاء المستخدم...');
    
    if (!validateForm()) {
      console.log('❌ فشل في التحقق من صحة البيانات');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📧 التحقق من البريد الإلكتروني:', formData.email);
      
      // التحقق من وجود البريد الإلكتروني
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        console.log('❌ البريد الإلكتروني مستخدم بالفعل');
        showError(t('newUser.emailExists'), t('general.error'));
        return;
      }

      // الحصول على معرف المتجر الحالي
      const currentStoreId = getStoreId();
      console.log('🏪 معرف المتجر الحالي:', currentStoreId);
      
      if (!currentStoreId) {
        console.log('❌ لم يتم العثور على معرف المتجر');
        showError(t('newUser.storeNotFound'), t('general.error'));
        return;
      }

      // إعداد بيانات المستخدم الجديد
      const newUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'admin' as const, // تعيين الدور كمدير
        status: 'active' as const, // تعيين الحالة كنشط
        store: currentStoreId, // ربط المستخدم بالمتجر الحالي
        addresses: [{
          type: 'home' as const,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country,
          isDefault: true
        }]
      };

      console.log('📤 إرسال بيانات المستخدم الجديد:', newUserData);

      // استدعاء API إنشاء المستخدم
      const createdUser = await createUser(newUserData);
      
      console.log('📥 استجابة API:', createdUser);
      
      if (createdUser) {
        console.log('✅ تم إنشاء المستخدم بنجاح');
        
        
        try {
          const storeSlug = window.location.pathname.split('/')[1] || 'default';
          const otpResult = await sendOTP(formData.email, storeSlug);
          
          if (otpResult.success) {
            console.log('📧 تم إرسال OTP بنجاح');
            setShowOTP(true);
          } else {
            console.log('❌ فشل في إرسال OTP:', otpResult.error);
            showError(otpResult.error || 'Failed to send verification code', t('general.error'));
            
            // إعادة تعيين الفورم في حالة فشل إرسال OTP
            resetForm();
            
            // استدعاء callback إذا كان موجوداً
            if (onUserCreated) {
              onUserCreated();
            } else {
              // إعادة توجيه للصفحة الرئيسية بعد النجاح
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
          }
        } catch (otpError) {
          console.error('💥 خطأ في إرسال OTP:', otpError);
          showError('Failed to send verification code', t('general.error'));
          
          // إعادة تعيين الفورم في حالة فشل إرسال OTP
          resetForm();
          
          // استدعاء callback إذا كان موجوداً
          if (onUserCreated) {
            onUserCreated();
          } else {
            // إعادة توجيه للصفحة الرئيسية بعد النجاح
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        }
      } else {
        console.log('❌ فشل في إنشاء المستخدم:', createUserError);
        showError(createUserError || t('newUser.error'), t('general.error'));
      }
    } catch (error) {
      console.error('💥 خطأ في إنشاء المستخدم:', error);
      showError(t('newUser.generalError'), t('general.error'));
    } finally {
      setIsLoading(false);
    }
  };


  if (showOTP) {
    return (
      <OTPVerification
        email={formData.email}
        onVerificationSuccess={handleOTPSuccess}
        onResendCode={handleOTPResend}
        onBack={handleOTPBack}
      />
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 relative">
     


      <div className="w-full max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PersonAdd className="text-white text-2xl" />
            </div>
            <h2 className={`text-3xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
              {t('newUser.title')}
            </h2>
            <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
              {t('newUser.subtitle')}
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

             {/* Avatar */}
             <div className="space-y-2">
               <CustomFileInput
                 label={t('newUser.avatar')}
                 onChange={(file) => {
                   const selectedFile = Array.isArray(file) ? file[0] || null : file;
                   setAvatarFile(selectedFile);
                   console.log('Selected avatar file:', selectedFile);
                 }}
                 placeholder={t('newUser.avatarPlaceholder')}
                 id="avatar"
                 isRTL={language === 'ARABIC'}
                 beforeChangeValidate={imageValidator}
               />
             </div>

             {/* Address Section */}
             <div className="space-y-4">
               <h3 className={`text-lg font-semibold text-gray-800 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                 {t('newUser.addressSection')}
               </h3>
               
               {/* Street */}
               <div className="space-y-2">
                 <CustomInput
                   label={t('newUser.street')}
                   type="text"
                   name="address.street"
                   id="street"
                   value={addressData.street}
                   onChange={handleInputChange}
                   placeholder={t('newUser.streetPlaceholder')}
                 />
               </div>

               {/* City and State */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <CustomInput
                     label={t('newUser.city')}
                     type="text"
                     name="address.city"
                     id="city"
                     value={addressData.city}
                     onChange={handleInputChange}
                     placeholder={t('newUser.cityPlaceholder')}
                   />
                 </div>
                 <div className="space-y-2">
                   <CustomInput
                     label={t('newUser.state')}
                     type="text"
                     name="address.state"
                     id="state"
                     value={addressData.state}
                     onChange={handleInputChange}
                     placeholder={t('newUser.statePlaceholder')}
                   />
                 </div>
               </div>

               {/* Zip Code and Country */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <CustomInput
                     label={t('newUser.zipCode')}
                     type="text"
                     name="address.zipCode"
                     id="zipCode"
                     value={addressData.zipCode}
                     onChange={handleInputChange}
                     placeholder={t('newUser.zipCodePlaceholder')}
                   />
                 </div>
                 <div className="space-y-2">
                   <CustomInput
                     label={t('newUser.country')}
                     type="text"
                     name="address.country"
                     id="country"
                     value={addressData.country}
                     onChange={handleInputChange}
                     placeholder={t('newUser.countryPlaceholder')}
                   />
                 </div>
               </div>
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
              text={isLoading || createUserLoading ? t('newUser.creatingUser') : t('newUser.createUser')}
              color="purple"
              type="submit"
              disabled={isLoading || createUserLoading}
              className="w-full py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
              icon={isLoading || createUserLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : <PersonAdd />}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewUserRegistration; 