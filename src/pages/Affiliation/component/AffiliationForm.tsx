import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomRadioGroup from '../../../components/common/CustomRadioGroup';
import { useTranslation } from 'react-i18next';
import CustomTextArea from '../../../components/common/CustomTextArea';
// import CustomSwitch from '../../../components/common/CustomSwitch';
// import CustomSelect from '../../../components/common/CustomSelect';
import CustomPhoneInput from '../../../components/common/CustomPhoneInput';
import { generateAffiliateLink } from '../../../utils/storeUtils';

interface AffiliationFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPhoneChange?: (value: string) => void;
  isRTL: boolean;
  errors: { [key: string]: string };
  affiliates?: any[];
  isEdit?: boolean;
}

const AffiliationForm: React.FC<AffiliationFormProps> = ({ form, onFormChange, onPhoneChange, isRTL, errors, affiliates = [], isEdit = false }) => {
  // Suppress unused warning - kept for future use
  void affiliates;
  void generateAffiliateLink;
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}
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

      {/* Email and Password - Password only visible in create mode */}
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
        
        {/* Password - Only show in create mode */}
        {!isEdit && (
          <CustomInput
            label={t('affiliation.password')}
            name="password"
            type="password"
            value={form.password || ''}
            onChange={onFormChange}
            error={errors.password}
            required
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile */}
        <CustomPhoneInput
          label={t('affiliation.mobile')}
          value={form.mobile || ''}
          onChange={onPhoneChange || (() => {})}
          error={errors.mobile}
          required
          
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

      {/* Affiliate Link - Only show in edit mode (backend generates it on create) */}
      {isEdit && form.affiliateLink && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            {t('affiliation.affiliateLink')}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.affiliateLink || ''}
              readOnly
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
              placeholder={t('affiliation.affiliateLinkPlaceholder')}
            />
          </div>
          {errors.affiliateLink && (
            <p className="text-sm text-red-600">{errors.affiliateLink}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isRTL 
              ? '🔗 الرابط تم إنشاؤه تلقائياً بواسطة النظام' 
              : '🔗 Link was automatically generated by the system'}
          </p>
        </div>
      )}

      {/* Notes */}
      {/* <CustomTextArea
        label={t('affiliation.notes') || 'Notes'}
        name="notes"
        value={form.notes || ''}
        onChange={onFormChange}
        error={errors.notes}
        placeholder={t('affiliation.notesPlaceholder') || 'Additional notes about this affiliate...'}
        dir={isRTL ? 'rtl' : 'ltr'}
      /> */}
    </div>
  );
};

export default AffiliationForm;
