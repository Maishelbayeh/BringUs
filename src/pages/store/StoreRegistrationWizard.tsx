import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { 
  Close,  
  Store, 
  Person,
  CheckCircle,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import useLanguage from '@/hooks/useLanguage';
import StoreGeneralInfo from './StoreGeneralInfo';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import OTPVerification from '../../components/Auth/OTPVerification';
import { useUser } from '@/hooks/useUser';
import { useStore } from '../../hooks/useStore';
import { useOwner } from '../../hooks/useOwner';
import useOTP from '../../hooks/useOTP';
import { validateWhatsApp } from '@/utils/validation';

interface StoreRegistrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MerchantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  addresses: {
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }[];
}

const StoreRegistrationWizard: React.FC<StoreRegistrationWizardProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  
  // استخدام الـ hooks
  const { createUser, checkEmailExists } = useUser();
  const { createStore, uploadStoreLogo } = useStore();
  const { createOwner } = useOwner();
  const { sendOTP } = useOTP();
  const [currentStep, setCurrentStep] = useState(1);
  const [merchantData, setMerchantData] = useState<MerchantData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    addresses: [{
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ' ',
      isDefault: true
    }]
  });
  const [merchantErrors, setMerchantErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  // إضافة state لتخزين ملف اللوجو
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [isStoreValid, setIsStoreValid] = useState(false);
  const [isMerchantValid, setIsMerchantValid] = useState(false);
  
  // إضافة state للتحكم في OTP
  const [showOTP, setShowOTP] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // معالجة إعادة إرسال OTP
  const handleOTPResend = () => {
    console.log('📧 تم إعادة إرسال OTP');
   
  };

  // معالجة العودة من صفحة OTP
  const handleOTPBack = () => {
    setShowOTP(false);
    if (registrationData) {
      console.log('العودة من OTP - بيانات التسجيل:', registrationData);
    }
    setRegistrationData(null);
  };

  // دالة استرجاع البيانات المحفوظة من localStorage
  const loadSavedStoreData = () => {
    try {
      const savedData = localStorage.getItem('tempStoreData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // التحقق من أن البيانات حديثة (أقل من 24 ساعة)
        const isDataRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000;
        
        if (isDataRecent) {
          console.log('📂 تم استرجاع بيانات المتجر المحفوظة:', parsedData);
          setStoreData(parsedData);
          return true;
        } else {
          // البيانات قديمة، احذفها
          localStorage.removeItem('tempStoreData');
          console.log('🗑️ تم حذف البيانات القديمة');
        }
      }
    } catch (error) {
      console.error('❌ خطأ في استرجاع البيانات المحفوظة:', error);
      localStorage.removeItem('tempStoreData');
    }
    return false;
  };

  // دالة إعادة تعيين بيانات الويزرد

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = t('signup.firstNameRequired');
        } else if (value.length < 2) {
          error = t('signup.firstNameMinLength');
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          error = t('signup.lastNameRequired');
        } else if (value.length < 2) {
          error = t('signup.lastNameMinLength');
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = t('signup.emailRequired');
        } else if (/[^\u0000-\u007F]/.test(value)) {
          error = t('signup.emailEnglishOnly');
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = t('signup.emailInvalid');
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = t('signup.passwordRequired');
        } else if (value.length < 6) {
          error = t('signup.passwordMinLength');
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          error = t('signup.confirmPasswordRequired');
        } else if (value !== merchantData.password) {
          error = t('signup.passwordsNotMatch');
        }
        break;
      case 'phone':
        // التحقق من رقم الهاتف - استخدام validateWhatsApp المتطور
        if (!value || !value.trim()) {
          error = t('signup.phoneRequired');
        } else {
          const phoneError = validateWhatsApp(value, t);
          if (phoneError) {
            error = phoneError;
          }
        }
        break;
    }
    
    return error;
  };

  const handleMerchantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMerchantData(prev => ({ ...prev, [name]: value }));
    
    // الفالديشن المباشر
    const error = validateField(name, value);
    setMerchantErrors(prev => ({ ...prev, [name]: error }));
    
    // Real-time password confirmation validation
    if (name === 'confirmPassword') {
      if (value && value !== merchantData.password) {
        setMerchantErrors(prev => ({ ...prev, confirmPassword: t('signup.passwordsNotMatch') }));
      } else if (value && value === merchantData.password) {
        setMerchantErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
    
    if (name === 'password') {
      if (merchantData.confirmPassword && value !== merchantData.confirmPassword) {
        setMerchantErrors(prev => ({ ...prev, confirmPassword: t('signup.passwordsNotMatch') }));
      } else if (merchantData.confirmPassword && value === merchantData.confirmPassword) {
        setMerchantErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }

    // تحقق من تكرار البريد الإلكتروني فقط إذا لم يكن هناك خطأ آخر
    if (name === 'email' && value && !error) {
      // Add delay to avoid too many API calls
      const timeoutId = setTimeout(async () => {
        if (value && /\S+@\S+\.\S+/.test(value)) {
          setIsCheckingEmail(true);
          try {
            const emailExists = await checkEmailExists(value);
            if (emailExists) {
              setMerchantErrors(prev => ({ 
                ...prev, 
                email: t('signup.emailAlreadyExists') 
              }));
            }
          } catch (error) {
            //CONSOLE.error('Error checking email:', error);
          } finally {
            setIsCheckingEmail(false);
          }
        }
      }, 500); // 1 second delay

      // Cleanup timeout on next change
      return () => clearTimeout(timeoutId);
    }
  };

  const validateMerchantForm = () => {
    const newErrors: Partial<MerchantData> = {};
    
    if (!merchantData.firstName) {
      newErrors.firstName = t('signup.firstNameRequired');
    }
    
    if (!merchantData.lastName) {
      newErrors.lastName = t('signup.lastNameRequired');
    }
    
    if (!merchantData.email) {
      newErrors.email = t('signup.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(merchantData.email)) {
      newErrors.email = t('signup.emailInvalid');
    }
    // التحقق من تكرار البريد الإلكتروني سيتم إضافته عندما يكون API جاهز
    
    if (!merchantData.password) {
      newErrors.password = t('signup.passwordRequired');
    } else if (merchantData.password.length < 6) {
      newErrors.password = t('signup.passwordMinLength');
    }
    
    if (!merchantData.confirmPassword) {
      newErrors.confirmPassword = t('signup.confirmPasswordRequired');
    } else if (merchantData.password !== merchantData.confirmPassword) {
      newErrors.confirmPassword = t('signup.passwordsNotMatch');
    }
    
    if (!merchantData.phone || !merchantData.phone.trim()) {
      newErrors.phone = t('signup.phoneRequired');
    } else {
      const cleanValue = merchantData.phone.replace(/\s/g, '');
      console.log('cleanValue', cleanValue);
      
      if (cleanValue.startsWith('970') || cleanValue.startsWith('972')) {
        console.log('cleanValue2', cleanValue);
        const code = cleanValue.startsWith('970') ? '970' : '972';
        const numberWithoutCode = cleanValue.slice(code.length);
        console.log(numberWithoutCode);
        
        // 🚫 تحقق: عدم السماح ببدء الجزء المحلي بـ 0
        if (numberWithoutCode.startsWith('0')) {
          newErrors.phone = t('store.whatsappNoLeadingZero'); // لا تبدأ بـ 0 بعد المقدمة
        }
        // ✅ تحقق: الطول الكلي يجب أن يكون 12 رقمًا بالضبط (مثلاً +970598765432)
        else if (cleanValue.length !== 12) {
          newErrors.phone = t('store.whatsappLengthError'); // الطول غير صحيح
        }
        // ✅ تحقق من أن الباقي كله أرقام
        else if (!/^\d+$/.test(numberWithoutCode)) {
          newErrors.phone = t('store.whatsappInvalidDigits'); // يجب أن يحتوي على أرقام فقط
        }
      } else {
        // تحقق عام للأرقام الدولية الأخرى
        if (cleanValue.length < 8 || cleanValue.length > 15) {
          newErrors.phone = t('store.whatsappLengthError');
        } else if (!/^[\+]?[1-9][\d]{4,15}$/.test(cleanValue)) {
          newErrors.phone = t('store.whatsappInvalidFormat');
        }
      }
    }
    
    // Note: Address validation is handled by the backend
    // Frontend validation for addresses is simplified to avoid TypeScript complexity
    
    setMerchantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStoreSubmit = async () => {
    
    if (!storeData || !isStoreValid) {
      
      return;
    }
    
      try {
        // حفظ بيانات المتجر في localStorage قبل الانتقال للمرحلة الثانية
        const storeDataToSave = {
          ...storeData,
          timestamp: Date.now() // إضافة timestamp للتحقق من صحة البيانات
        };
        
        localStorage.setItem('tempStoreData', JSON.stringify(storeDataToSave));
        console.log('💾 تم حفظ بيانات المتجر مؤقتاً:', storeDataToSave);
        
        setCurrentStep(2);
      
    } catch (error) {
      //CONSOLE.error('❌ خطأ في حفظ بيانات المتجر:', error);
     
    }
  };

  // استرجاع البيانات المحفوظة عند تحميل المكون
  useEffect(() => {
    if (isOpen) {
      const hasLoadedData = loadSavedStoreData();
      if (hasLoadedData) {
        console.log('✅ تم استرجاع بيانات المتجر بنجاح');
        console.log('📊 البيانات المحملة:', storeData);
      }
    }
  }, [isOpen]);

  // التحقق من صحة نموذج التاجر
  useEffect(() => {
    const hasErrors = Object.values(merchantErrors).some(error => !!error);
    const hasAllFields = merchantData.firstName.trim() && 
                        merchantData.lastName.trim() && 
                        merchantData.email.trim() && 
                        merchantData.password.trim() && 
                        merchantData.confirmPassword.trim() && 
                        merchantData.phone.trim();
    const isEmailValid = merchantData.email.trim() && /\S+@\S+\.\S+/.test(merchantData.email) && !merchantErrors.email;
    const isPasswordValid = merchantData.password.trim() && merchantData.password.length >= 6;
    const isPasswordMatch = merchantData.password === merchantData.confirmPassword;
    const isPhoneValid = (() => {
      if (!merchantData.phone.trim()) return false;
      if (merchantErrors.phone) return false;
      
      const cleanPhone = merchantData.phone.replace(/[^\d+]/g, '');
      
      // Check if it contains only numbers and + symbol
      if (!/^[\+]?[\d]+$/.test(cleanPhone)) return false;
      
      // Check if it starts with + (international format)
      if (cleanPhone.startsWith('+')) {
        return cleanPhone.length >= 8 && cleanPhone.length <= 16 && /^\+[1-9]\d{7,15}$/.test(cleanPhone);
      }
      // Check if it doesn't start with + (local format)
      else {
        return cleanPhone.length >= 7 && cleanPhone.length <= 15 && /^[1-9]\d{6,14}$/.test(cleanPhone);
      }
    })();
    
    const isValid = !hasErrors && !!hasAllFields && !!isEmailValid && !!isPasswordValid && !!isPasswordMatch && !!isPhoneValid;
    setIsMerchantValid(isValid);
  }, [merchantErrors, merchantData]);

  const handleStoreDataChange = async (storeData: any) => {
    console.log('🔍 البيانات المستلمة من StoreGeneralInfo:', storeData);
    console.log('🔍 contact.email في البيانات المستلمة:', storeData.contact?.email);
    
    setStoreData(storeData);
    
    // إذا كان هناك ملف لوجو جديد، احفظه
    if (storeData.logo && storeData.logo.url && storeData.logo.url.startsWith('blob:')) {
      // نحتاج للحصول على ملف اللوجو من StoreGeneralInfo
      // سنقوم بإضافة prop لتمرير ملف اللوجو
      console.log('🔄 تم حفظ بيانات المتجر مع لوجو جديد');
    }
  };

  const handleLogoFileChange = (file: File | null) => {
    setStoreLogoFile(file);
    console.log('🔄 تم حفظ ملف اللوجو:', file ? file.name : 'تم إزالة اللوجو');
  };

  const handleMerchantSubmit = async () => {
    // التحقق من صحة نموذج المالك
    const isValid = validateMerchantForm();
    
    if (!isValid) {
      //CONSOLE.log('❌ نموذج المالك يحتوي على أخطاء، لا يمكن إكمال التسجيل');
      return;
    }
    
    //CONSOLE.log('✅ نموذج المالك صحيح، جاري إكمال التسجيل...');
    
    // إكمال العملية
    await handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    try {
      if (!storeData) {
        alert('يرجى إكمال بيانات المتجر أولاً');
        return;
      }

      if (!isMerchantValid) {
        alert('يرجى إكمال جميع الحقول المطلوبة في بيانات المالك بشكل صحيح');
        return;
      }

      setIsSubmitting(true);

      // 1. إنشاء المتجر أولاً بدون لوجو
      console.log('🔄 إنشاء المتجر بدون لوجو...');
      const storeDataWithoutLogo = {
        ...storeData,
        logo: { public_id: null, url: null } // بدون لوجو في البداية
      };
      
      const store = await createStore(storeDataWithoutLogo);
      
      if (!store) {
        console.error('❌ فشل في إنشاء المتجر');
        alert('فشل في إنشاء المتجر، يرجى المحاولة مرة أخرى');
        return;
      }
      
      console.log('✅ تم إنشاء المتجر بنجاح:', store);
      
      // 2. إذا كان هناك ملف لوقو، ارفعه للمتجر الجديد
      if (storeLogoFile) {
        console.log('🔄 رفع اللوقو للمتجر الجديد:', store.id || store._id);
        try {
          const logoResult = await uploadStoreLogo(storeLogoFile, store.id || store._id);
           if (logoResult) {
           console.log('✅ تم رفع اللوقو بنجاح:', logoResult);
          //   const updatedStore = await updateStore(store.id || store._id || '', { logo: logoResult });
          //   if (updatedStore) {
            
          //     setStoreData((prev: any) => ({ ...prev, createdStore: updatedStore }));
          //   }
           }
        } catch (logoError) {
          console.error('❌ خطأ في رفع اللوقو:', logoError);
          // لا نوقف العملية إذا فشل رفع اللوقو
        }
      }

      // التأكد من وجود store ID
      const storeId = store.id || store._id;
      if (!storeId) {
        console.error('❌ خطأ: لم يتم العثور على ID للمتجر');
        alert('خطأ في بيانات المتجر. يرجى المحاولة مرة أخرى.');
        return;
      }

      // إعداد بيانات التاجر مع إضافة store ID
      const merchantDataForBackend = {
        firstName: merchantData.firstName,
        lastName: merchantData.lastName,
        email: merchantData.email,
        password: merchantData.password,
        phone: merchantData.phone,
        role: 'admin' as const,
        status: 'active' as const,
        addresses: merchantData.addresses,
        store: {
          _id: storeId // إرسال كـ object
        }
      };

      //CONSOLE.log('Created Store:', store);
      //CONSOLE.log('Store ID being sent:', storeId);
      //CONSOLE.log('Merchant Data with Store ID:', merchantDataForBackend);

      // 3. تسجيل المستخدم مع store ID
    
      const user = await createUser(merchantDataForBackend);
    
      
      if (!user) {
       
        return;
      }

      
      const userId = user.id;
      
     
      
      if (!userId) {
        
        alert('خطأ في بيانات المستخدم. يرجى المحاولة مرة أخرى.');
        return;
      }
      
      const ownerData = {
        userId: userId,
        storeId: storeId,
        status: 'active' as const,
        permissions: [
          'manage_store',
          'manage_users',
          'manage_products',
          'manage_categories',
          'manage_orders',
          'manage_inventory',
          'view_analytics',
          'manage_settings'
        ],
        isPrimaryOwner: false
      };
      
      const owner = await createOwner(ownerData);
      
      if (!owner) {
        //CONSOLE.error('❌ فشل في ربط المستخدم بالمتجر');
        alert('فشل في ربط المستخدم بالمتجر. يرجى المحاولة مرة أخرى.');
        return;
      }
      
     
      console.log('🎉 تم التسجيل الكامل بنجاح!');
      console.log('User:', user);
      console.log('Store:', store);
      console.log('Owner:', owner);
      
      // مسح البيانات المؤقتة بعد نجاح التسجيل
      localStorage.removeItem('tempStoreData');
      console.log('🗑️ تم مسح البيانات المؤقتة بعد نجاح التسجيل');
      
      // حفظ بيانات التسجيل
      setRegistrationData({ user, store, owner });
      
      // إرسال OTP للتحقق من الإيميل
      try {
        const storeSlug = store.slug || (store as any).name?.toLowerCase().replace(/\s+/g, '-') || 'default';
        
        
        const otpResult = await sendOTP(merchantData.email, storeSlug);
        
        
        if (otpResult.success) {
        
          setShowOTP(true);
        } else {
         
          setShowOTP(true);
          
         
        }
      } catch (otpError) {
        console.error('💥 خطأ في إرسال OTP:', otpError);
       
        console.log('🧪 للاختبار: سيتم عرض صفحة OTP حتى لو حدث خطأ');
        setShowOTP(true);
        
      }
    } catch (error) {
      
      alert('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setMerchantData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      addresses: [{
        type: 'home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ' ',
        isDefault: true
      }]
    });
    setMerchantErrors({});
    
    // مسح البيانات المحفوظة مؤقتاً
    localStorage.removeItem('tempStoreData');
    console.log('🗑️ تم مسح البيانات المؤقتة');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
          >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              {currentStep === 1 ? <Store className="text-white" /> : <Person className="text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStep === 1 ? t('general.next') : t('store.registerMerchant')}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === 1 ? t('store.storeStepDesc') : t('store.merchantStepDesc')}
              </p>
              {currentStep === 1 && !isStoreValid && (
                <p className="text-xs text-red-500 mt-1">
                  {t('storeRegistration.completeStoreInfo')}
                </p>
              )}
              {currentStep === 1 && isStoreValid && (
                <p className="text-xs text-green-500 mt-1">
                  {t('storeRegistration.storeInfoComplete')}
                </p>
              )}
              {currentStep === 2 && !isMerchantValid && (
                <p className="text-xs text-red-500 mt-1">
                  {t('storeRegistration.completeMerchantInfo')}
                </p>
              )}
              {currentStep === 2 && isMerchantValid && (
                <p className="text-xs text-green-500 mt-1">
                  {t('storeRegistration.merchantInfoComplete')}
                </p>
              )}
              {currentStep === 2 && !isMerchantValid && merchantData.phone && !merchantData.phone.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  {t('signup.phoneRequired')}
                </p>
              )}
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {currentStep > 1 && isStoreValid ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Close className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] relative">
          {showOTP ? (
            // OTP Verification Step
            <OTPVerification
              email={merchantData.email}
              onResendCode={handleOTPResend}
              onBack={handleOTPBack}
            />
          ) : currentStep === 1 ? (
            // Step 1: Store Registration
            <div className="max-w-2xl mx-auto">
             

                            <StoreGeneralInfo 
                onSubmit={handleStoreDataChange}
                onValidate={setIsStoreValid}
                onLogoFileChange={handleLogoFileChange}
                initialData={storeData}
              />
              
              {/* Navigation Buttons */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex flex-col items-end gap-2">
                  {!isStoreValid && (
                    <span className="text-xs text-red-500">
                      {t('storeRegistration.completeStoreInfo')}
                    </span>
                  )}
                  <CustomButton
                    text={t('general.next')}
                    color={isStoreValid ? "primary" : "gray"}
                    textColor="white"
                    action={handleStoreSubmit}
                   
                    className="flex items-center gap-2"
                    disabled={!isStoreValid}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Merchant Registration
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('store.merchantInfo')}
                </h3>
                <p className="text-gray-600">
                  {t('store.merchantInfoDesc')}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleMerchantSubmit(); }} className="space-y-6">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
                  <CustomInput
                    label={t('signup.firstName')}
                    type="text"
                    name="firstName"
                    value={merchantData.firstName}
                    onChange={handleMerchantInputChange}
                    placeholder={t('signup.firstNamePlaceholder')}
                    error={merchantErrors.firstName}
                    required
                  />
                  <CustomInput
                    label={t('signup.lastName')}
                    type="text"
                    name="lastName"
                    value={merchantData.lastName}
                    onChange={handleMerchantInputChange}
                    placeholder={t('signup.lastNamePlaceholder')}
                    error={merchantErrors.lastName}
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <CustomInput
                    label={t('signup.email')}
                    type="email"
                    name="email"
                    value={merchantData.email}
                    onChange={handleMerchantInputChange}
                    placeholder={t('signup.emailPlaceholder')}
                    error={merchantErrors.email}
                    required
                  />
                  {isCheckingEmail && (
                    <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="relative">
                    <CustomPhoneInput
                      label={t('signup.phone')}
                      value={merchantData.phone}
                      onChange={val => {
                        setMerchantData(prev => ({ ...prev, phone: val }));
                        
                        // استخدام نفس منطق الفالديشن المحسن
                        let phoneError = '';
                        
                        // إزالة المسافات من البداية والنهاية
                        const trimmedVal = val ? val.trim() : '';
                        
                        if (!trimmedVal) {
                          phoneError = t('signup.phoneRequired');
                        } else {
                          const cleanValue = trimmedVal.replace(/\s/g, '');
                          console.log('cleanValue', cleanValue);
                          
                          if (cleanValue.startsWith('970') || cleanValue.startsWith('972')) {
                            console.log('cleanValue2', cleanValue);
                            const code = cleanValue.startsWith('970') ? '970' : '972';
                            const numberWithoutCode = cleanValue.slice(code.length);
                            console.log(numberWithoutCode);
                            
                            // 🚫 تحقق: عدم السماح ببدء الجزء المحلي بـ 0
                            if (numberWithoutCode.startsWith('0')) {
                              phoneError = t('store.whatsappNoLeadingZero'); // لا تبدأ بـ 0 بعد المقدمة
                            }
                            // ✅ تحقق: الطول الكلي يجب أن يكون 12 رقمًا بالضبط (مثلاً +970598765432)
                            else if (cleanValue.length !== 12) {
                              phoneError = t('store.whatsappLengthError'); // الطول غير صحيح
                            }
                            // ✅ تحقق من أن الباقي كله أرقام
                            else if (!/^\d+$/.test(numberWithoutCode)) {
                              phoneError = t('store.whatsappInvalidDigits'); // يجب أن يحتوي على أرقام فقط
                            }
                          } else {
                            // تحقق عام للأرقام الدولية الأخرى
                            if (cleanValue.length < 8 || cleanValue.length > 15) {
                              phoneError = t('store.whatsappLengthError');
                            } else if (!/^[\+]?[1-9][\d]{4,15}$/.test(cleanValue)) {
                              phoneError = t('store.whatsappInvalidFormat');
                            }
                          }
                        }
                        
                        // تحديث الأخطاء فوراً
                        setMerchantErrors(prev => {
                          const newErrors = { ...prev, phone: phoneError };
                          return newErrors;
                        });
                      }}
                      required
                      error=""
                     
                    />
                    {merchantErrors.phone && (
                      <span className="mt-1 text-xs text-red-600 block" dir={isRTL ? 'rtl' : 'ltr'}>{merchantErrors.phone}</span>
                    )}
                   
                    {!merchantErrors.phone && (!merchantData.phone || !merchantData.phone.trim()) && (
                      <span className="mt-1 text-xs text-gray-500 block" dir={isRTL ? 'rtl' : 'ltr'}  >{t('signup.phoneRequired')}</span>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                  <h4 className={`text-md font-semibold text-gray-800 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('signup.address')}
                  </h4>
                  
                  {/* Street */}
                  <CustomInput
                    label={t('signup.street')}
                    type="text"
                    name="street"
                    value={merchantData.addresses[0]?.street || ''}
                    onChange={(e) => {
                      const newAddresses = [...merchantData.addresses];
                      newAddresses[0] = { ...newAddresses[0], street: e.target.value };
                      setMerchantData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                    placeholder={t('signup.streetPlaceholder')}
                  />

                  {/* City and State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      label={t('signup.city')}
                      type="text"
                      name="city"
                      value={merchantData.addresses[0]?.city || ''}
                      onChange={(e) => {
                        const newAddresses = [...merchantData.addresses];
                        newAddresses[0] = { ...newAddresses[0], city: e.target.value };
                        setMerchantData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      placeholder={t('signup.cityPlaceholder')}
                    />
                    <CustomInput
                      label={t('signup.state')}
                      type="text"
                      name="state"
                      value={merchantData.addresses[0]?.state || ''}
                      onChange={(e) => {
                        const newAddresses = [...merchantData.addresses];
                        newAddresses[0] = { ...newAddresses[0], state: e.target.value };
                        setMerchantData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      placeholder={t('signup.statePlaceholder')}
                    />
                  </div>

                  {/* Zip Code and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      label={t('signup.zipCode')}
                      type="text"
                      name="zipCode"
                      value={merchantData.addresses[0]?.zipCode || ''}
                      onChange={(e) => {
                        const newAddresses = [...merchantData.addresses];
                        newAddresses[0] = { ...newAddresses[0], zipCode: e.target.value };
                        setMerchantData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      placeholder={t('signup.zipCodePlaceholder')}
                    />
                    <CustomInput
                      label={t('signup.country')}
                      type="text"
                      name="country"
                      value={merchantData.addresses[0]?.country || ''}
                      onChange={(e) => {
                        const newAddresses = [...merchantData.addresses];
                        newAddresses[0] = { ...newAddresses[0], country: e.target.value };
                        setMerchantData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      placeholder={t('signup.countryPlaceholder')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <label htmlFor="password" className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      {t('signup.password')}<span className={`${isRTL ? 'mr-1' : 'ml-1'} text-red-500`}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={merchantData.password}
                        onChange={handleMerchantInputChange}
                        placeholder={t('signup.passwordPlaceholder')}
                        className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
                            bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary
                            ${merchantErrors.password ? 'border-red-500' : ''}`}
                        style={{ 
                          direction: isRTL ? 'rtl' : 'ltr',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        {showPassword ? <Visibility /> :<VisibilityOff /> }
                      </button>
                    </div>
                    {merchantErrors.password && (
                      <span className="mt-1 text-xs text-red-600 block">{merchantErrors.password}</span>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <label htmlFor="confirmPassword" className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      {t('signup.confirmPassword')} <span className={`${isRTL ? 'mr-1' : 'ml-1'} text-red-500`}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={merchantData.confirmPassword}
                        onChange={handleMerchantInputChange}
                        placeholder={t('signup.confirmPasswordPlaceholder')}
                        className={`appearance-none border text-sm rounded-lg block w-full p-3 transition-all duration-200
                            bg-gray-50 text-gray-900 border-gray-300 focus:ring-primary focus:border-primary
                            ${merchantErrors.confirmPassword ? 'border-red-500' : ''}`}
                        style={{ 
                          direction: isRTL ? 'rtl' : 'ltr',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        {showConfirmPassword ? <Visibility /> :<VisibilityOff />}
                      </button>
                      {/* Green check icon when passwords match - positioned after text */}
                      {merchantData.confirmPassword && 
                       merchantData.password === merchantData.confirmPassword && 
                       !merchantErrors.confirmPassword && 
                       merchantData.password.length <= 20 && (
                        <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-12' : 'right-12'} z-10 pointer-events-none`}>
                          <CheckCircle className="text-green-500 text-lg" />
                        </div>
                      )}
                    </div>
                    {merchantErrors.confirmPassword && (
                      <span className="mt-1 text-xs text-red-600 block">{merchantErrors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} flex justify-between items-center mt-8 pt-6 border-t border-gray-200`}>
                  <CustomButton
                    text={t('common.back')}
                    color="gray"
                    textColor="gray-700"
                    bordercolor="gray-300"
                    action={() => {
                      // استرجاع البيانات المحفوظة عند الرجوع
                      const hasLoadedData = loadSavedStoreData();
                      if (hasLoadedData) {
                        console.log('📂 تم استرجاع بيانات المتجر عند الرجوع');
                      }
                      setCurrentStep(1);
                    }}
                   
                    className="flex items-center gap-2"
                  />
                  
                  <div className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} flex items-center gap-4`}>
                   
                    <div className={`${isRTL ? 'items-start' : 'items-end'} flex flex-col  gap-2 justify-end`}>
                      {!isMerchantValid && (
                        <span className="text-xs text-red-500">
                          {t('storeRegistration.completeMerchantInfo')}
                        </span>
                      )}
                      <CustomButton
                        text={isSubmitting ? t('store.registering') : (isMerchantValid ? t('store.registerMerchant') : t('store.registerMerchant'))}
                        color={isMerchantValid && !isSubmitting ? "primary" : "gray"}
                        textColor="white"
                        type="submit"
                        icon={isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (isMerchantValid ? <Person className="w-4 h-4" /> : undefined)}
                        className="flex items-center gap-2"
                        disabled={!isMerchantValid || isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-6"></div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {t('store.registering')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t('store.pleaseWait')}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default StoreRegistrationWizard;