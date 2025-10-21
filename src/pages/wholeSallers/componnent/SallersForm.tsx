import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../../components/common/CustomInput';
import CustomTextArea from '../../../components/common/CustomTextArea';
import CustomPhoneInput from '../../../components/common/CustomPhoneInput';

interface SallersFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPhoneChange?: (value: string) => void;
  isRTL: boolean;
  isEdit: boolean;
  errors: { [key: string]: string };
  isCheckingEmail?: boolean;
  emailAvailable?: boolean | null;
  emailMessage?: { message: string; messageAr: string } | null;
}

const SallersForm: React.FC<SallersFormProps> = ({ 
  form, 
  onFormChange, 
  onPhoneChange, 
  isRTL, 
  isEdit, 
  errors,
  isCheckingEmail = false,
  emailAvailable = null,
  emailMessage = null
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="space-y-4">
      {/* Email availability status banner */}
      {!isEdit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            {isCheckingEmail && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-blue-700">
                  {t('users.checkingEmail') || 'Checking email availability...'}
                </span>
              </>
            )}
            {!isCheckingEmail && emailAvailable === true && (
              <>
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-700">
                  {currentLang === 'ar' || currentLang === 'ar-EG'
                    ? (emailMessage?.messageAr || t('users.emailAvailable') || 'البريد الإلكتروني متاح')
                    : (emailMessage?.message || t('users.emailAvailable') || 'Email is available')
                  }
                </span>
              </>
            )}
            {!isCheckingEmail && emailAvailable === false && (
              <>
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">
                  {t('signup.emailAlreadyExists') || 'Email already exists'}
                </span>
              </>
            )}
            {!isCheckingEmail && emailAvailable === null && form.email && form.email.trim() && (
              <span className="text-sm text-gray-600">
                {t('users.enterValidEmail') || 'Enter a valid email to check availability'}
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {/* First Name */}
        <CustomInput
          label={t('wholesalers.firstName')}
          name="firstName"
          value={form.firstName || ''}
          onChange={onFormChange}
          error={errors.firstName}
          required
        />
        
        {/* Last Name */}
        <CustomInput
          label={t('wholesalers.lastName')}
          name="lastName"
          value={form.lastName || ''}
          onChange={onFormChange}
          error={errors.lastName}
          required
        />
      </div>

      {/* Email with real-time check */}
      <div className="relative">
        <CustomInput
          label={t('wholesalers.email')}
          name="email"
          type="email"
          value={form.email || ''}
          onChange={onFormChange}
          error={errors.email}
          required
        />
        {/* Email availability indicator */}
        {!isEdit && form.email && form.email.includes('@') && (
          <div className={`absolute top-9 flex items-center ${isRTL ? 'left-3' : 'right-3'}`}>
            {isCheckingEmail && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            )}
            {!isCheckingEmail && emailAvailable === true && (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {!isCheckingEmail && emailAvailable === false && (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Password */}
      <CustomInput
        label={t('wholesalers.password')}
        name="password"
        type="password"
        value={form.password || ''}
        onChange={onFormChange}
        error={errors.password}
        required={!isEdit}
        placeholder={isEdit 
          ? (isRTL ? 'اتركه فارغاً للاحتفاظ بكلمة السر الحالية' : 'Leave empty to keep current password')
          : (isRTL ? 'أدخل كلمة السر' : 'Enter password')
        }
      />

      {/* Mobile */}
      <CustomPhoneInput
        label={t('wholesalers.mobile')}
        value={form.mobile || ''}
        onChange={onPhoneChange || (() => {})}
        error={errors.mobile}
        required
        
      />

      {/* Discount */}
      <CustomInput
        label={t('wholesalers.discount')}
        name="discount"
        type="number"
        value={form.discount || 0}
        onChange={onFormChange}
        error={errors.discount}
        required
        min="0"
        max="100"
      />

      {/* Address */}
      <CustomTextArea
        label={t('wholesalers.address')}
        name="address"
        value={form.address || ''}
        onChange={onFormChange}
        error={errors.address}
        required
        dir={isRTL ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default SallersForm;
