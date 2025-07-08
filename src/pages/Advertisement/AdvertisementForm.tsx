import React from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';
import CustomInput from '../../components/common/CustomInput';

interface AdvertisementFormProps {
  formHtml: string;
  setFormHtml: (v: string) => void;
  formStatus: 'Active' | 'Inactive';
  setFormStatus: (v: 'Active' | 'Inactive') => void;
  formTitle?: string;
  setFormTitle?: (v: string) => void;
  isRTL: boolean;
  t: any;
  handleSubmit: (e: React.FormEvent) => void;
  renderHtml?: (html: string) => { __html: string };
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({ 
  formHtml, 
  setFormHtml, 
  formStatus, 
  setFormStatus, 
  formTitle = '',
  setFormTitle = () => {},
  isRTL, 
  t, 
  handleSubmit, 
  renderHtml 
}) => {
  // fallback renderHtml if not provided
  const safeRenderHtml = renderHtml || ((html: string) => {
    try {
      return { __html: html };
    } catch (error) {
      return { __html: '<p style="color: red;">Error rendering HTML</p>' };
    }
  });

  return (
    <div className="p-4 flex flex-col space-y-4">
      {/* Title Field */}
      <CustomInput
        label={t('advertisement.title', 'Title')}
        value={formTitle}
        onChange={e => setFormTitle(e.target.value)}
        placeholder={t('advertisement.titlePlaceholder', 'Enter advertisement title')}
        dir={isRTL ? 'rtl' : 'ltr'}
        name="title"
        required
      />
      
      {/* HTML Content Field */}
      <CustomTextArea
        label={t('advertisement.htmlContent', 'HTML Content')}
        value={formHtml}
        onChange={e => setFormHtml(e.target.value)}
        placeholder={t('advertisement.htmlPlaceholder', '<div style="background: red; color: white; padding: 20px;">Your HTML here</div>')}
        dir={isRTL ? 'rtl' : 'ltr'}
        name="htmlContent"
        rows={6}
      />
      
      {/* HTML Preview */}
      <div className="mb-4">
        <label className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('advertisement.preview', 'Preview')}
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[120px] max-h-[200px] overflow-y-auto">
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
      
      {/* Status Field */}
      <CustomRadioGroup
        label={t('advertisement.status', 'Status')}
        name="status"
        value={formStatus}
        onChange={e => setFormStatus(e.target.value as 'Active' | 'Inactive')}
        options={[
          { value: 'Active', label: t('advertisement.active', 'Active') },
          { value: 'Inactive', label: t('advertisement.inactive', 'Inactive') },
        ]}
      />
    </div>
  );
};

export default AdvertisementForm; 