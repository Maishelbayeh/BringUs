import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomRadioGroup from '../../../components/common/CustomRadioGroup';
import { useTranslation } from 'react-i18next';
import CustomTextArea from '../../../components/common/CustomTextArea';
import CustomSwitch from '../../../components/common/CustomSwitch';
import CustomSelect from '../../../components/common/CustomSelect';
import { generateAffiliateLink } from '../../../utils/storeUtils';

interface AffiliationFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isRTL: boolean;
  errors: { [key: string]: string };
  affiliates?: any[];
}

const AffiliationForm: React.FC<AffiliationFormProps> = ({ form, onFormChange, isRTL, errors, affiliates = [] }) => {
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

      {/* Affiliate Link */}
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
          <button
            type="button"
            onClick={() => {
              // إنشاء رابط فريد جديد
              let newLink = '';
              let attempts = 0;
              const maxAttempts = 10;
              
              while (!newLink && attempts < maxAttempts) {
                const generatedLink = generateAffiliateLink();
                // التحقق من عدم التكرار مع المسوقين الحاليين
                if (generatedLink && !affiliates?.some(aff => aff.affiliateLink === generatedLink)) {
                  newLink = generatedLink;
                }
                attempts++;
              }
              
              if (newLink) {
                const event = {
                  target: {
                    name: 'affiliateLink',
                    value: newLink
                  }
                } as any;
                onFormChange(event);
              }
            }}
            className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            {t('affiliation.regenerateLink') || 'إعادة إنشاء'}
          </button>
        </div>
        {errors.affiliateLink && (
          <p className="text-sm text-red-600">{errors.affiliateLink}</p>
        )}
      </div>

      {/* Bank Information Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">{t('affiliation.bankInfo') || 'Bank Information'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Name */}
          <CustomInput
            label={t('affiliation.bankName') || 'Bank Name'}
            name="bankInfo.bankName"
            value={form.bankInfo?.bankName || ''}
            onChange={onFormChange}
            error={errors['bankInfo.bankName']}
            
          />
          
          {/* Account Number */}
          <CustomInput
            label={t('affiliation.accountNumber') || 'Account Number'}
            name="bankInfo.accountNumber"
            value={form.bankInfo?.accountNumber || ''}
            onChange={onFormChange}
            error={errors['bankInfo.accountNumber']}
            
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* IBAN */}
          <CustomInput
            label={t('affiliation.iban') || 'IBAN'}
            name="bankInfo.iban"
            value={form.bankInfo?.iban || ''}
            onChange={onFormChange}
            error={errors['bankInfo.iban']}
            
          />
          
          {/* Swift Code */}
          <CustomInput
            label={t('affiliation.swiftCode') || 'Swift Code'}
            name="bankInfo.swiftCode"
            value={form.bankInfo?.swiftCode || ''}
            onChange={onFormChange}
            error={errors['bankInfo.swiftCode']}
           
          />
        </div>
      </div>

      {/* Settings Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">{t('affiliation.settings') || 'Payment Settings'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto Payment */}
          <CustomSwitch
            label={t('affiliation.autoPayment') || 'Auto Payment'}
            name="settings.autoPayment"
            checked={form.settings?.autoPayment || false}
            onChange={(e) => {
              const event = {
                target: {
                  name: 'settings.autoPayment',
                  value: e.target.checked
                }
              } as any;
              onFormChange(event);
            }}
          />
          
          {/* Payment Threshold */}
          <CustomInput
            label={t('affiliation.paymentThreshold') || 'Payment Threshold'}
            name="settings.paymentThreshold"
            type="number"
            value={form.settings?.paymentThreshold || 0}
            onChange={onFormChange}
            error={errors['settings.paymentThreshold']}
            min="0"
          />
        </div>

        {/* Payment Method */}
        <CustomSelect
          label={t('affiliation.paymentMethod') || 'Payment Method'}
          name="settings.paymentMethod"
          value={form.settings?.paymentMethod || 'bank_transfer'}
          onChange={onFormChange}
          error={errors['settings.paymentMethod']}
          searchable={true}
          options={[
            { value: 'bank_transfer', label: t('affiliation.bankTransfer') || 'Bank Transfer' },
            { value: 'cash', label: t('affiliation.cash') || 'Cash' },
            { value: 'check', label: t('affiliation.check') || 'Check' },
            { value: 'paypal', label: 'PayPal' }
          ]}
        />
      </div>

      {/* Notes */}
      <CustomTextArea
        label={t('affiliation.notes') || 'Notes'}
        name="notes"
        value={form.notes || ''}
        onChange={onFormChange}
        error={errors.notes}
        placeholder={t('affiliation.notesPlaceholder') || 'Additional notes about this affiliate...'}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default AffiliationForm;
