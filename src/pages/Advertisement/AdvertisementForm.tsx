import React from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';

interface AdvertisementFormProps {
  formHtml: string;
  setFormHtml: (v: string) => void;
  formStatus: 'Active' | 'Inactive';
  setFormStatus: (v: 'Active' | 'Inactive') => void;
  isRTL: boolean;
  t: any;
  handleSubmit: (e: React.FormEvent) => void;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({ formHtml, setFormHtml, formStatus, setFormStatus, isRTL, t, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col">
      <CustomTextArea
        label={t('advertisement.inputLabel')}
        value={formHtml}
        onChange={e => setFormHtml(e.target.value)}
        placeholder="<h1>My Ad</h1>"
        labelAlign={isRTL ? 'right' : 'left'}
        dir={isRTL ? 'rtl' : 'ltr'}
        name="html"
      />
      <CustomRadioGroup
        label={t('advertisement.status', 'Status')}
        name="status"
        value={formStatus}
        onChange={e => setFormStatus(e.target.value as 'Active' | 'Inactive')}
        options={[
          { value: 'Active', label: t('advertisement.active', 'Active') },
          { value: 'Inactive', label: t('advertisement.inactive', 'Inactive') },
        ]}
        labelAlign={isRTL ? 'right' : 'left'}
        isRTL={isRTL}
      />
    </form>
  );
};

export default AdvertisementForm; 