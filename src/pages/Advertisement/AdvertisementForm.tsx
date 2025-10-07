import React, { useState } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import { createImageValidationFunction } from '../../validation/imageValidation';
import { AdvertisementValidationErrors } from '../../validation/advertisementValidation';

interface AdvertisementFormProps {
  formHtml: string;
  setFormHtml: (v: string) => void;
  formStatus: 'Active' | 'Inactive';
  setFormStatus: (v: 'Active' | 'Inactive') => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  isRTL: boolean;
  t: any;
  renderHtml?: (html: string) => { __html: string };
  image: string | null;
  setImage: (v: string | null) => void;
  mode: 'html' | 'image';
  setMode: (v: 'html' | 'image') => void;
  setImageUploading?: (v: boolean) => void;
  errors?: AdvertisementValidationErrors;
  onFieldChange?: (fieldName: string, value: any) => void;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({ 
  formHtml, 
  setFormHtml, 
  formStatus, 
  setFormStatus, 
  formTitle,
  setFormTitle,
  isRTL, 
  t, 
  renderHtml,
  image,
  setImage,
  mode,
  setMode,
  setImageUploading: setImageUploadingProp,
  errors = {},
  onFieldChange
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
  
  // Update parent state when imageUploading changes
  React.useEffect(() => {
    if (setImageUploadingProp) {
      setImageUploadingProp(imageUploading);
    }
  }, [imageUploading, setImageUploadingProp]);

  // رفع صورة مباشرة عند الاختيار
  const handleImageChange = async (file: File) => {
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const formData = new FormData();
        const res = await fetch(base64);
        const blob = await res.blob();
        formData.append('file', blob, file.name || 'advertisement-image.png');
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api/'}advertisements/upload-image`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data && uploadData.data.url) {
          setImage(uploadData.data.url);
          if (onFieldChange) {
            onFieldChange('image', uploadData.data.url);
          }
        } else {
          setImage(null);
        }
      } catch (err) {
        setImage(null);
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
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
              onChange={() => {
                setMode('html');
                // Clear image error when switching to HTML mode
                if (onFieldChange) {
                  onFieldChange('image', null);
                }
              }}
            />
            {t('advertisement.typeHtml', 'HTML')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="image"
              checked={mode === 'image'}
              onChange={() => {
                setMode('image');
                // Clear html error when switching to Image mode
                if (onFieldChange) {
                  onFieldChange('htmlContent', '');
                }
              }}
            />
            {t('advertisement.image', 'Image')}
          </label>
        </div>
      </div>

      {/* Title Field */}
      <CustomInput
        label={t('advertisement.title', 'Title')}
        value={formTitle}
        onChange={e => {
          setFormTitle(e.target.value);
          if (onFieldChange) {
            onFieldChange('title', e.target.value);
          }
        }}
        placeholder={t('advertisement.titlePlaceholder', 'Enter advertisement title')}
        dir={isRTL ? 'rtl' : 'ltr'}
        name="title"
        required
        error={errors.title}
      />

      {/* HTML Content Field */}
      {mode === 'html' && (
        <>
          <CustomTextArea
            label={t('advertisement.htmlContent', 'HTML Content')}
            value={formHtml}
            onChange={e => {
              setFormHtml(e.target.value);
              if (onFieldChange) {
                onFieldChange('htmlContent', e.target.value);
              }
            }}
            placeholder={t('advertisement.htmlPlaceholder', '<div style="background: red; color: white; padding: 20px;">Your HTML here</div>')}
            dir={ 'ltr'}
            name="htmlContent"
            rows={6}
            required
            error={errors.htmlContent}
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
            label={t('advertisement.advertisementImage', 'Advertisement Image')}
            value={image ? [image] : []}
            onChange={file => {
              if (file instanceof File) {
                handleImageChange(file);
              } else if (typeof file === 'string') {
                setImage(file);
                if (onFieldChange) {
                  onFieldChange('image', file);
                }
              } else {
                setImage(null);
                if (onFieldChange) {
                  onFieldChange('image', null);
                }
              }
            }}
            beforeChangeValidate={imageValidator}
            multiple={false}
            isRTL={isRTL}
            required
            error={errors.image}
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

    </div>
  );
};

export default AdvertisementForm; 