import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomRadioGroup from '../../../components/common/CustomRadioGroup';
import CustomTextArea from '../../../components/common/CustomTextArea';
import { useTranslation } from 'react-i18next';

interface SallersFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isRTL: boolean;
  isEdit?: boolean;
}

const SallersForm: React.FC<SallersFormProps> = ({ form, onFormChange, isRTL, isEdit = false }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
      <CustomInput
        label={t('wholesalers.email')}
        name="email"
        type="email"
        value={form.email}
        onChange={onFormChange}
        required 
      />

      <CustomInput
        label={t('wholesalers.firstName')}
        name="firstName"
        value={form.firstName}
        onChange={onFormChange}
        required
        
      />
      <CustomInput
        label={t('wholesalers.lastName')}
        name="lastName"
        value={form.lastName}
        onChange={onFormChange}
        required
        
      />
      <CustomInput
        label={t('wholesalers.mobile')}
        name="mobile"
        value={form.mobile}
        onChange={onFormChange}
        required
       
      />
      <CustomInput
        label={t('wholesalers.discount')}
        name="discount"
        type="number"
        value={form.discount}
        onChange={onFormChange}
        required
        
      />
      {isEdit && (
        <CustomRadioGroup
          label={t('wholesalers.status')}
          name="status"
          value={form.status}
          onChange={onFormChange}
          options={[
            { value: 'Active', label: t('wholesalers.active') },
            { value: 'Inactive', label: t('wholesalers.inactive') },
            // { value: 'Suspended', label: t('wholesalers.suspended') || 'Suspended' },
            // { value: 'Pending', label: t('wholesalers.pending') || 'Pending' },
          ]}
        />
      )}
      <CustomTextArea
        label={t('wholesalers.address')}
        name="address"
        value={form.address}
        onChange={e => onFormChange(e as any)}
        
        dir={isRTL ? 'rtl' : 'ltr'}
      />
    </div>
  );
};

export default SallersForm;
