import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Close, 
  ArrowBack, 
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
import { useUser } from '@/hooks/useUser';
import { useStore } from '../../hooks/useStore';
import { useOwner } from '../../hooks/useOwner';

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
  const { createStore, uploadStoreLogo, updateStore } = useStore();
  const { createOwner } = useOwner();
  
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
        if (!value || !value.trim()) {
          error = t('signup.phoneRequired');
        } else {
          // Remove all spaces and special characters except + and numbers
          const cleanPhone = value.replace(/[^\d+]/g, '');
          
          // Check if it contains only numbers and + symbol
          if (!/^[\+]?[\d]+$/.test(cleanPhone)) {
            error = t('signup.phoneNumbersOnly');
          }
          // Check if it starts with + (international format)
          else if (cleanPhone.startsWith('+')) {
            // For international numbers starting with +
            if (cleanPhone.length < 8) {
              error = t('signup.phoneTooShort');
            } else if (cleanPhone.length > 16) {
              error = t('signup.phoneTooLong');
            } else if (!/^\+[1-9]\d{7,15}$/.test(cleanPhone)) {
              error = t('signup.phoneInvalidFormat');
            }
          }
          // Check if it doesn't start with + (local format)
          else {
            // For local numbers (without country code)
            if (cleanPhone.length < 7) {
              error = t('signup.phoneTooShort');
            } else if (cleanPhone.length > 15) {
              error = t('signup.phoneTooLong');
            } else if (!/^[1-9]\d{6,14}$/.test(cleanPhone)) {
              error = t('signup.phoneInvalidFormat');
            }
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
      // Remove all spaces and special characters except + and numbers
      const cleanPhone = merchantData.phone.replace(/[^\d+]/g, '');
      
      // Check if it contains only numbers and + symbol
      if (!/^[\+]?[\d]+$/.test(cleanPhone)) {
        newErrors.phone = t('signup.phoneNumbersOnly');
      }
      // Check if it starts with + (international format)
      else if (cleanPhone.startsWith('+')) {
        // For international numbers starting with +
        if (cleanPhone.length < 8) {
          newErrors.phone = t('signup.phoneTooShort');
        } else if (cleanPhone.length > 16) {
          newErrors.phone = t('signup.phoneTooLong');
        } else if (!/^\+[1-9]\d{7,15}$/.test(cleanPhone)) {
          newErrors.phone = t('signup.phoneInvalidFormat');
        }
      }
      // Check if it doesn't start with + (local format)
      else {
        // For local numbers (without country code)
        if (cleanPhone.length < 7) {
          newErrors.phone = t('signup.phoneTooShort');
        } else if (cleanPhone.length > 15) {
          newErrors.phone = t('signup.phoneTooLong');
        } else if (!/^[1-9]\d{6,14}$/.test(cleanPhone)) {
          newErrors.phone = t('signup.phoneInvalidFormat');
        }
      }
    }
    
    // Note: Address validation is handled by the backend
    // Frontend validation for addresses is simplified to avoid TypeScript complexity
    
    setMerchantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStoreSubmit = async () => {
    // التحقق من صحة نموذج المتجر
    if (!storeData || !isStoreValid) {
      //CONSOLE.log('❌ نموذج المتجر يحتوي على أخطاء، لا يمكن الانتقال للخطوة التالية');
      return;
    }
    
    try {
      // حفظ بيانات المتجر محلياً فقط (بدون إنشاء في الباك إند)
      console.log('✅ تم حفظ بيانات المتجر محلياً، جاري الانتقال للخطوة التالية...');
      
      // الانتقال للخطوة الثانية
      setCurrentStep(2);
      
    } catch (error) {
      //CONSOLE.error('❌ خطأ في حفظ بيانات المتجر:', error);
     
    }
  };

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
            // تحديث المتجر باللوقو الجديد
            const updatedStore = await updateStore(store.id || store._id || '', { logo: logoResult });
            if (updatedStore) {
              console.log('✅ تم تحديث المتجر باللوقو الجديد:', updatedStore);
              // تحديث store في state
              setStoreData((prev: any) => ({ ...prev, createdStore: updatedStore }));
            }
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
      //CONSOLE.log('🔄 جاري تسجيل المستخدم مع store ID...');
      const user = await createUser(merchantDataForBackend);
      
      if (!user) {
        //CONSOLE.error('❌ فشل في تسجيل المستخدم');
        return;
      }

      // 4. ربط المستخدم بالمتجر كمالك
      //CONSOLE.log('🔄 جاري ربط المستخدم بالمتجر...');
      
      // التأكد من استخدام الـ ID الصحيح
      const userId = user.id;
      
      //CONSOLE.log('🔍 User ID:', { id: user.id, finalId: userId });
      //CONSOLE.log('🔍 Store ID:', { id: store.id, finalId: storeId });
      
      if (!userId) {
        //CONSOLE.error('❌ خطأ: لم يتم العثور على ID للمستخدم');
        //CONSOLE.error('User:', user);
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
      
      //CONSOLE.log('✅ تم ربط المستخدم بالمتجر بنجاح:', owner);

      // نجاح العملية
      //CONSOLE.log('🎉 تم التسجيل الكامل بنجاح!');
      //CONSOLE.log('User:', user);
      //CONSOLE.log('Store:', store);
      //CONSOLE.log('Owner:', owner);
      
      alert('تم التسجيل بنجاح!');
      
      // إغلاق الويزرد
      onClose();
      
      // إعادة تعيين البيانات
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
          country: '',
          isDefault: true
        }]
      });
      setMerchantErrors({});
      setStoreData(null);
    } catch (error) {
      //CONSOLE.error('❌ خطأ في التسجيل:', error);
      alert('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
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
                {currentStep === 1 ? t('store.createStore') : t('store.registerMerchant')}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === 1 ? (
            // Step 1: Store Registration
            <div className="max-w-2xl mx-auto">
             

                            <StoreGeneralInfo 
                onSubmit={handleStoreDataChange}
                onValidate={setIsStoreValid}
                onLogoFileChange={handleLogoFileChange}
              />
              
              {/* Navigation Buttons */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col items-end gap-2">
                  {!isStoreValid && (
                    <span className="text-xs text-red-500">
                      {t('storeRegistration.completeStoreInfo')}
                    </span>
                  )}
                  <CustomButton
                    text={isStoreValid ? t('store.createStore') : t('store.createStore')}
                    color={isStoreValid ? "primary" : "gray"}
                    textColor="white"
                    action={handleStoreSubmit}
                    icon={isStoreValid ? <Store className="w-4 h-4" /> : undefined}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          // Remove all spaces and special characters except + and numbers
                          const cleanPhone = trimmedVal.replace(/[^\d+]/g, '');
                          
                          // Check if it contains only numbers and + symbol
                          if (!/^[\+]?[\d]+$/.test(cleanPhone)) {
                            phoneError = t('signup.phoneNumbersOnly');
                          }
                          // Check if it starts with + (international format)
                          else if (cleanPhone.startsWith('+')) {
                            // For international numbers starting with +
                            if (cleanPhone.length < 8) {
                              phoneError = t('signup.phoneTooShort');
                            } else if (cleanPhone.length > 16) {
                              phoneError = t('signup.phoneTooLong');
                            } else if (!/^\+[1-9]\d{7,15}$/.test(cleanPhone)) {
                              phoneError = t('signup.phoneInvalidFormat');
                            }
                          }
                          // Check if it doesn't start with + (local format)
                          else {
                            // For local numbers (without country code)
                            if (cleanPhone.length < 7) {
                              phoneError = t('signup.phoneTooShort');
                            } else if (cleanPhone.length > 15) {
                              phoneError = t('signup.phoneTooLong');
                            } else if (!/^[1-9]\d{6,14}$/.test(cleanPhone)) {
                              phoneError = t('signup.phoneInvalidFormat');
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
                      placeholder={t('signup.phonePlaceholder')}
                    />
                    {merchantErrors.phone && (
                      <span className="mt-1 text-xs text-red-600 block">{merchantErrors.phone}</span>
                    )}
                    {!merchantErrors.phone && merchantData.phone && merchantData.phone.trim().length > 0 && (() => {
                      const cleanPhone = merchantData.phone.replace(/[^\d+]/g, '');
                      if (cleanPhone.startsWith('+')) {
                        return cleanPhone.length >= 8 && cleanPhone.length <= 16 && /^\+[1-9]\d{7,15}$/.test(cleanPhone);
                      } else {
                        return cleanPhone.length >= 7 && cleanPhone.length <= 15 && /^[1-9]\d{6,14}$/.test(cleanPhone);
                      }
                    })() && (
                      <span className="mt-1 text-xs text-green-600 block">{t('signup.phoneValid')}</span>
                    )}
                    {!merchantErrors.phone && (!merchantData.phone || !merchantData.phone.trim()) && (
                      <span className="mt-1 text-xs text-gray-500 block">{t('signup.phoneRequired')}</span>
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
                    <label htmlFor="password" className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('signup.password')}
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
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                    <label htmlFor="confirmPassword" className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('signup.confirmPassword')}
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
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </button>
                      {/* Green check icon when passwords match */}
                      {merchantData.confirmPassword && merchantData.password === merchantData.confirmPassword && !merchantErrors.confirmPassword && (
                        <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-12' : 'left-12'}`}>
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
                    action={() => setCurrentStep(1)}
                    icon={<ArrowBack className="w-4 h-4" />}
                    className="flex items-center gap-2"
                  />
                  
                  <div className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} flex items-center gap-4`}>
                    <span className="text-sm text-gray-500">
                      {t('storeRegistration.step')} 2/2
                    </span>
                    <div className="flex flex-col items-end gap-2">
                      {!isMerchantValid && (
                        <span className="text-xs text-red-500">
                          {t('storeRegistration.completeMerchantInfo')}
                        </span>
                      )}
                      <CustomButton
                        text={isMerchantValid ? t('store.registerMerchant') : t('store.registerMerchant')}
                        color={isMerchantValid ? "primary" : "gray"}
                        textColor="white"
                        type="submit"
                        icon={isMerchantValid ? <Person className="w-4 h-4" /> : undefined}
                        className="flex items-center gap-2"
                        disabled={!isMerchantValid}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default StoreRegistrationWizard;