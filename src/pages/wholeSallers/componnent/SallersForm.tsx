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
}

const SallersForm: React.FC<SallersFormProps> = ({ form, onFormChange, onPhoneChange, isRTL, isEdit, errors }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
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

      {/* Email */}
      <CustomInput
        label={t('wholesalers.email')}
        name="email"
        type="email"
        value={form.email || ''}
        onChange={onFormChange}
        error={errors.email}
        required
      />

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
