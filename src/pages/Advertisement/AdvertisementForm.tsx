import React, { useState } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';
import CustomInput from '../../components/common/CustomInput';
// import FormImageGallery from '../../components/common/FormImageGallery';
import CustomFileInput from '../../components/common/CustomFileInput';
import { createImageValidationFunction } from '../../validation/imageValidation';

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
  image: string | null;
  setImage: (v: string | null) => void;
  mode: 'html' | 'image';
  setMode: (v: 'html' | 'image') => void;
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
  renderHtml,
  image,
  setImage,
  mode,
  setMode
}) => {
  // fallback renderHtml if not provided
  const safeRenderHtml = renderHtml || ((html: string) => {
    try {
      return { __html: html };
    } catch (error) {
      return { __html: '<p style="color: red;">Error rendering HTML</p>' };
    }
  });

  // Create image validation function
  const imageValidator = createImageValidationFunction(t);
  const [imageUploading, setImageUploading] = useState(false);

  // رفع صورة مباشرة عند الاختيار
  const handleImageChange = async (file: File) => {
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const formData = new FormData();
        // يمكنك استخدام fetch(base64).then(res => res.blob())
        const res = await fetch(base64);
        const blob = await res.blob();
        formData.append('file', blob, file.name || 'advertisement-image.png');
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/'}advertisements/upload-image`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data && uploadData.data.url) {
          setImage(uploadData.data.url);
        } else {
          alert('Image upload failed');
          setImage(null);
        }
      } catch (err) {
        alert('Image upload failed');
        setImage(null);
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // تحقق من أن أحد الحقلين موجود عند الإرسال
  const onSubmit = (e: React.FormEvent) => {
    if (mode === 'html' && !formHtml.trim()) {
      alert(t('advertisement.htmlRequired', 'HTML content is required'));
      e.preventDefault();
      return;
    }
    if (mode === 'image' && !image) {
      alert(t('advertisement.imageRequired', 'Image is required'));
      e.preventDefault();
      return;
    }
    handleSubmit(e);
  };

  return (
    <form className="p-4 flex flex-col space-y-4" onSubmit={onSubmit}>
      {/* اختيار نوع الإعلان */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {t('advertisement.type', 'Advertisement Type')}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="html"
              checked={mode === 'html'}
              onChange={() => setMode('html')}
            />
            {t('advertisement.typeHtml', 'HTML')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="image"
              checked={mode === 'image'}
              onChange={() => setMode('image')}
            />
            {t('advertisement.typeImage', 'Image')}
          </label>
        </div>
      </div>

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
      {mode === 'html' && (
        <>
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
        </>
      )}

      {/* Image Field */}
      {mode === 'image' && (
        <div>
          <CustomFileInput
            label={t('advertisement.image', 'Advertisement Image')}
            value={image ? [image] : []}
            onChange={file => {
              if (file instanceof File) {
                handleImageChange(file);
              } else if (typeof file === 'string') {
                setImage(file);
              } else {
                setImage(null);
              }
            }}
            beforeChangeValidate={imageValidator}
            multiple={false}
            isRTL={isRTL}
          />
          {imageUploading && (
            <div className="text-primary mt-2">{t('common.loading', 'Uploading image...')}</div>
          )}
        </div>
      )}

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

      {/* زر الإرسال */}
      <button type="submit" className="btn btn-primary" disabled={imageUploading}>
        {imageUploading ? t('common.loading', 'Uploading...') : t('advertisement.save', 'Save Advertisement')}
      </button>
    </form>
  );
};

export default AdvertisementForm; 