import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomRadioGroup from '../../../components/common/CustomRadioGroup';
import { useTranslation } from 'react-i18next';
import CustomTextArea from '../../../components/common/CustomTextArea';

interface AffiliationFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isRTL: boolean;
  errors: { [key: string]: string };
}

const AffiliationForm: React.FC<AffiliationFormProps> = ({ form, onFormChange, isRTL, errors }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <CustomInput
          label={t('affiliation.firstName')}
          name="firstName"
          value={form.firstName || ''}
          onChange={onFormChange}
          error={errors.firstName}
          required
        />
        
        {/* Last Name */}
        <CustomInput
          label={t('affiliation.lastName')}
          name="lastName"
          value={form.lastName || ''}
          onChange={onFormChange}
          error={errors.lastName}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <CustomInput
          label={t('affiliation.email')}
          name="email"
          type="email"
          value={form.email || ''}
          onChange={onFormChange}
          error={errors.email}
          required
        />
        
        {/* Password */}
        <CustomInput
          label={t('affiliation.password')}
          name="password"
          type="password"
          value={form.password || ''}
          onChange={onFormChange}
          error={errors.password}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile */}
        <CustomInput
          label={t('affiliation.mobile')}
          name="mobile"
          type="tel"
          value={form.mobile || ''}
          onChange={onFormChange}
          error={errors.mobile}
          required
          placeholder="+972xxxxxxxxx"
        />
        
        {/* Percent */}
        <CustomInput
          label={t('affiliation.percent')}
          name="percent"
          type="number"
          value={form.percent || 0}
          onChange={onFormChange}
          error={errors.percent}
          required
          min="0"
          max="100"
        />
      </div>

      {/* Status */}
      <CustomRadioGroup
        label={t('affiliation.status')}
        name="status"
        value={form.status || 'Active'}
        onChange={onFormChange}
        options={[
          { value: 'Active', label: t('affiliation.active') },
          { value: 'Inactive', label: t('affiliation.inactive') },
        ]}
      />

      {/* Address */}
      <CustomTextArea
        label={t('affiliation.address')}
        name="address"
        value={form.address || ''}
        onChange={onFormChange}
        error={errors.address}
        required
        dir={isRTL ? 'rtl' : 'ltr'}
      />

      {/* Link (Optional) */}
      <CustomInput
        label={t('affiliation.link')}
        name="link"
        value={form.link || ''}
        onChange={onFormChange}
        error={errors.link}
        placeholder="https://example.com"
      />
    </div>
  );
};

export default AffiliationForm;
