import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomRadioGroup from '../../../components/common/CustomRadioGroup';
import { useTranslation } from 'react-i18next';
import CustomTextArea from '@/components/common/CustomTextArea';

interface AffiliationFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isRTL: boolean;
}

const AffiliationForm: React.FC<AffiliationFormProps> = ({ form, onFormChange, isRTL }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
     
      <CustomInput
        label={t('affiliation.firstName')}
        name="firstName"
        value={form.firstName}
        onChange={onFormChange}
        required
       
      />
      <CustomInput
        label={t('affiliation.lastName')}
        name="lastName"
        value={form.lastName}
        onChange={onFormChange}
        required
       
      />
       <CustomInput
        label={t('affiliation.email')}
        name="email"
        type="email"
        value={form.email}
        onChange={onFormChange}
        required
       
      />
      <CustomInput
        label={t('affiliation.password')}
        name="password"
        type="password"
        value={form.password}
        onChange={onFormChange}
        required
       
      />
      <CustomInput
        label={t('affiliation.mobile')}
        name="mobile"
        value={form.mobile}
        onChange={onFormChange}
        required
       
      />
      <CustomInput
        label={t('affiliation.percent')}
        name="percent"
        type="number"
        value={form.percent}
        onChange={onFormChange}
        required
       
      />
      <CustomRadioGroup
        label={t('affiliation.status')}
        name="status"
        value={form.status}
        onChange={onFormChange}
        options={[
          { value: 'Active', label: t('affiliation.active') },
          { value: 'Inactive', label: t('affiliation.inactive') },
        ]}
      
      />
      <CustomTextArea
        label={t('affiliation.address')}
        name="address"
        value={form.address}
        onChange={onFormChange}
       
        dir={isRTL ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default AffiliationForm;
