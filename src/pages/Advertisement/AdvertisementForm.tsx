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
  renderHtml?: (html: string) => { __html: string };
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({ formHtml, setFormHtml, formStatus, setFormStatus, isRTL, t, handleSubmit, renderHtml }) => {
  // fallback renderHtml if not provided
  const safeRenderHtml = renderHtml || ((html: string) => {
    try {
      return { __html: html };
    } catch (error) {
      return { __html: '<p style="color: red;">Error rendering HTML</p>' };
    }
  });

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
      {/* HTML Preview */}
      <div className="mb-4">
      <label className={`block mb-1 text-sm font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('advertisement.preview', 'Preview')}</label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px]">
          {formHtml ? (
            <div
              className="max-w-none"
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#333',
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={safeRenderHtml(formHtml)}
            />
          ) : (
            <p className="text-gray-400 italic">{t('advertisement.noPreview', 'No preview available')}</p>
          )}
        </div>
      </div>
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