import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Visibility, 
  VisibilityOff, 
 
} from '@mui/icons-material';
import CustomInput from '@/components/common/CustomInput';


import useLanguage from '@/hooks/useLanguage';
import { getStoreId } from '@/hooks/useLocalStorage';
import { useUser } from '@/hooks/useUser';
import { useToastContext } from '@/contexts/ToastContext';

import CustomRadioGroup from '@/components/common/CustomRadioGroup';

interface UserFormProps {
  user?: any; // المستخدم للتعديل
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string; // لربط زر الحفظ في الفوتر من الخارج
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, formId }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  
  console.log('🎯 UserForm rendered with props:', { user, formId, isEditMode: !!user });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    // confirmPassword: '',
    phone: '',
    status: 'active'
  });

  
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
    
  });
  const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Allow dynamic keys like 'address.street'
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
 
  
  const { createUser, updateUser, checkEmailExists, checkPhoneExists, getAllUsers } = useUser();
  const { showSuccess, showError } = useToastContext();

  const isEditMode = !!user;

  // تحميل بيانات المستخدم للتعديل
  useEffect(() => {
    console.log('🔄 useEffect triggered with user:', user);
    if (user) {
      console.log('📝 Loading user data for edit mode');
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        // confirmPassword: '',
        phone: user.phone || '',
        status: user.status || 'active'
      });

      // تحميل العنوان
      const defaultAddress = user.addresses?.find((addr: any) => addr.isDefault) || user.addresses?.[0];
      console.log('🏠 Default address found:', defaultAddress);
      if (defaultAddress) {
        setAddressData({
          street: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zipCode: defaultAddress.zipCode || '',
          country: defaultAddress.country || ''
        });
      }
    } else {
      console.log('🆕 New user mode - no user data to load');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('📝 Input change:', { name, value, target: e.target });
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      console.log('🏠 Address field update:', { field, value, fullName: name });
      setAddressData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };
        console.log('🏠 New address data:', newData);
        return newData;
      });
      // مسح خطأ العنوان
      if (errors[`address.${field}`]) {
        setErrors(prev => ({
          ...prev,
          [`address.${field}`]: undefined
        }));
      }
    } else {
      console.log('👤 User field update:', { name, value });
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value
        };
        console.log('👤 New form data:', newData);
        return newData;
      });
      // مسح الخطأ عند الكتابة
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }

      // validation فوري لرقم الهاتف
      if (name === 'phone' && value.trim()) {
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        
        if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
          setErrors(prev => ({
            ...prev,
            phone: t('validation.phoneInvalid')
          }));
        } else if (cleanPhone.length > 15) {
          setErrors(prev => ({
            ...prev,
            phone: t('validation.phoneMaxLength')
          }));
        } else {
          // مسح خطأ رقم الهاتف إذا كان صحيحاً
          setErrors(prev => ({
            ...prev,
            phone: undefined
          }));
        }
      }
    }
  };

  const validateForm = () => {
    console.log('🔍 Starting form validation...');
    const newErrors: Record<string, string> = {};

    // التحقق من الاسم الأول
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('newUser.firstNameRequired');
      console.log('❌ First name validation failed');
    }

    // التحقق من الاسم الأخير
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('newUser.lastNameRequired');
      console.log('❌ Last name validation failed');
    }

    // التحقق من البريد الإلكتروني
    if (!formData.email.trim()) {
      newErrors.email = t('newUser.emailRequired');
      console.log('❌ Email validation failed');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('newUser.emailInvalid');
      console.log('❌ Email format validation failed');
    }

    // التحقق من كلمة المرور (فقط للمستخدمين الجدد)
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = t('newUser.passwordRequired');
      console.log('❌ Password validation failed');
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = t('newUser.passwordLength');
      console.log('❌ Password length validation failed');
    }

    // التحقق من رقم الهاتف
    if (!formData.phone.trim()) {
      newErrors.phone = t('newUser.phoneRequired');
      console.log('❌ Phone validation failed');
    } else {
      // التحقق من صحة تنسيق رقم الهاتف
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      
      if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
        newErrors.phone = t('validation.phoneInvalid');
        console.log('❌ Phone format validation failed');
      } else if (cleanPhone.length > 15) {
        newErrors.phone = t('validation.phoneMaxLength');
        console.log('❌ Phone length validation failed');
      }
    }

    // التحقق من العنوان
    if (!addressData.street.trim()) {
      newErrors['address.street'] = t('newUser.streetRequired');
      console.log('❌ Street validation failed');
    }
    if (!addressData.city.trim()) {
      newErrors['address.city'] = t('newUser.cityRequired');
      console.log('❌ City validation failed');
    }
    if (!addressData.state.trim()) {
      newErrors['address.state'] = t('newUser.stateRequired');
      console.log('❌ State validation failed');
    }
    if (!addressData.zipCode.trim()) {
      newErrors['address.zipCode'] = t('newUser.zipCodeRequired');
      console.log('❌ Zip code validation failed');
    }
    if (!addressData.country.trim()) {
      newErrors['address.country'] = t('newUser.countryRequired');
      console.log('❌ Country validation failed');
    }

    console.log('📋 Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Form validation result:', isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted!');
    console.log('📝 Form data:', formData);
    console.log('🏠 Address data:', addressData);
    
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with submission...');
    

    try {
      const storeId = getStoreId();
      console.log('🏪 Store ID:', storeId);
      if (!storeId) {
        showError(t('users.storeNotFound'), t('general.error'));
        return;
      }

      // التحقق من البريد الإلكتروني إذا كان إضافة جديدة
      if (!isEditMode) {
        console.log('🔍 Checking if email exists...');
        const emailExists = await checkEmailExists(formData.email);
        console.log('📧 Email exists check result:', emailExists);
        if (emailExists) {
          setErrors(prev => ({ ...prev, email: t('signup.emailAlreadyExists') }));
          return;
        }
      }

      // التحقق من تكرار رقم الهاتف (للمستخدمين الجدد والتعديل)
      console.log('🔍 Checking if phone exists...');
      const phoneExists = await checkPhoneExists(formData.phone);
      console.log('📱 Phone exists check result:', phoneExists);
      
      // إذا كان رقم الهاتف موجود، تحقق من أنه ليس لنفس المستخدم (في حالة التعديل)
      if (phoneExists) {
        if (isEditMode) {
          // في حالة التعديل، تحقق من أن الرقم ليس لنفس المستخدم
          const currentUser = await getAllUsers().then(users => users.find(u => u._id === user._id));
          if (currentUser && currentUser.phone === formData.phone) {
            console.log('✅ Phone number belongs to the same user, allowing update');
          } else {
            setErrors(prev => ({ ...prev, phone: t('validation.phoneAlreadyExists') }));
            return;
          }
        } else {
          // في حالة الإضافة الجديدة
          setErrors(prev => ({ ...prev, phone: t('validation.phoneAlreadyExists') }));
          return;
        }
      }

      const newUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'admin' as const,
        phone: formData.phone,
        status: formData.status as 'active' | 'inactive',
        addresses: [{
          type: 'home' as const,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country,
          isDefault: true
        }],
        store: storeId
      };
      
      console.log('📤 User data to send:', newUserData);

      let result;
      if (isEditMode) {
        // تحديث المستخدم
        const updateData = { ...newUserData } as any;
        if (!formData.password) {
          delete updateData.password;
        }
        console.log('🔄 Updating user...');
        result = await updateUser(user._id, updateData);
      } else {
        // إنشاء مستخدم جديد
        console.log('➕ Creating new user...');
        result = await createUser(newUserData);
      }
      
      console.log('📥 API result:', result);

      if (result) {
        showSuccess(
          isEditMode ? t('users.userUpdated') : t('users.userCreated'), 
          t('general.success')
        );
        onSuccess();
      } else {
        showError(
          isEditMode ? t('users.updateError') : t('users.createError'), 
          t('general.error')
        );
      }
    } catch (error) {
      console.error('❌ Error saving user:', error);
      showError(
        isEditMode ? t('users.updateError') : t('users.createError'), 
        t('general.error')
      );
    } finally {
      
    }
  };

  return (
    <form onSubmit={handleSubmit} id={formId} className="space-y-6">
      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label={t('signup.firstName')}
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
          required
         
        />
        
        <CustomInput
          label={t('signup.lastName')}
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
          required
         
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label={t('signup.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
         
        />
        
        <CustomInput
          label={t('signup.phone')}
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
          required
         
        />
      </div>

      {/* كلمة المرور */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <CustomInput
            label={isEditMode ? t('signup.newPassword') : t('signup.password')}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required={!isEditMode}
           
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-9 right-3 flex items-center"
          >
            {showPassword ? <VisibilityOff className="h-5 w-5 text-gray-400" /> : <Visibility className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        <CustomRadioGroup
          label={t('users.columns.status')}
          name="status"
          options={[{label: t('general.active'), value: 'active'}, {label: t('general.inactive'), value: 'inactive'}]}
          value={formData.status}
          onChange={(e) => handleInputChange(e)}
        />  
        {/* <div className="relative">
          <CustomInput
            label={t('signup.confirmPassword')}
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required={!isEditMode}
           
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-9 right-3 flex items-center"
          >
            {showConfirmPassword ? <VisibilityOff className="h-5 w-5 text-gray-400" /> : <Visibility className="h-5 w-5 text-gray-400" />}
          </button>
        </div> */}
      </div>

      {/* الأفاتار */}
      {/* <div>
        <CustomFileInput
          label={t('newUser.avatar')}
          onChange={(file) => setAvatarFile(Array.isArray(file) ? file[0] || null : file)}
          isRTL={isRTL}
        />
      </div> */}

      {/* العنوان */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {t('newUser.addressSection')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label={t('newUser.street')}
            name="address.street"
            value={addressData.street}
            onChange={handleInputChange}
            error={errors['address.street']}
           
          />
          
          <CustomInput
            label={t('newUser.city')}
            name="address.city"
            value={addressData.city}
            onChange={handleInputChange}
            error={errors['address.city']}
           
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <CustomInput
            label={t('newUser.state')}
            name="address.state"
            value={addressData.state}
            onChange={handleInputChange}
            error={errors['address.state']}
           
          />
          
          <CustomInput
            label={t('newUser.zipCode')}
            name="address.zipCode"
            value={addressData.zipCode}
            onChange={handleInputChange}
            error={errors['address.zipCode']}
           
          />
          
          <CustomInput
            label={t('newUser.country')}
            name="address.country"
            value={addressData.country}
            onChange={handleInputChange}
            error={errors['address.country']}
           
          />
        </div>
      </div>

      
      {/* {!isEditMode && (
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
            />
          </div>
          <div className="mr-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              {t('signup.agreeTerms')}
            </label>
            {errors.terms && (
              <p className="text-red-600 text-sm mt-1">{errors.terms}</p>
            )}
          </div>
        </div>
      )} */}
    </form>
  );
};

export default UserForm; 