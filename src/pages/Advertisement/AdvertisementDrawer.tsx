import React from 'react';
import AdvertisementForm from './AdvertisementForm';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';
import { AdvertisementValidationErrors } from '../../validation/advertisementValidation';

interface AdvertisementDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formHtml: string;
  setFormHtml: (v: string) => void;
  formStatus: 'Active' | 'Inactive';
  setFormStatus: (v: 'Active' | 'Inactive') => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  isRTL: boolean;
  renderHtml?: (html: string) => { __html: string };
  image: string | null;
  setImage: (v: string | null) => void;
  mode: 'html' | 'image';
  setMode: (v: 'html' | 'image') => void;
  editMode?: boolean;
  saving?: boolean;
  isImageUploading?: boolean;
  setImageUploading?: (v: boolean) => void;
  errors?: AdvertisementValidationErrors;
  onFieldChange?: (fieldName: string, value: any) => void;
}

const AdvertisementDrawer: React.FC<AdvertisementDrawerProps> = ({
  open,
  onClose,
  onSave,
  formHtml,
  setFormHtml,
  formStatus,
  setFormStatus,
  formTitle,
  setFormTitle,
  isRTL,
  renderHtml,
  image,
  setImage,
  mode,
  setMode,
  editMode = false,
  saving = false,
  isImageUploading = false,
  setImageUploading,
  errors = {},
  onFieldChange,
}) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(e);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`max-h-[85vh] bg-white rounded-2xl shadow-xl w-full max-w-lg mx-2 relative flex flex-col ${
          isRTL ? 'text-right' : 'text-left'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {editMode
              ? t('advertisement.edit', 'Edit Advertisement')
              : t('advertisement.add', 'Add Advertisement')}
          </span>
          <button
            onClick={onClose}
            className="text-primary hover:text-red-500 text-2xl"
            disabled={saving || isImageUploading}
          >
            ×
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto p-4 flex-1 flex flex-col">
          <AdvertisementForm
            formHtml={formHtml}
            setFormHtml={setFormHtml}
            formStatus={formStatus}
            setFormStatus={setFormStatus}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            isRTL={isRTL}
            t={t}
            renderHtml={renderHtml}
            image={image}
            setImage={setImage}
            mode={mode}
            setMode={setMode}
            setImageUploading={setImageUploading}
            errors={errors}
            onFieldChange={onFieldChange}
          />
        </form>
        
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel')}
            action={onClose}
            bordercolor="primary"
            disabled={saving || isImageUploading}
          />
          <div className="flex items-center gap-2">
            {isImageUploading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>{t('common.uploadingImage')}</span>
              </div>
            )}
            <CustomButton
              color="primary"
              textColor="white"
              text={
                saving
                  ? isRTL
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : t('common.save')
              }
              type="submit"
              onClick={handleSubmit}
              disabled={saving || isImageUploading}
              icon={
                saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementDrawer;

