// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React from 'react';
import StoreSliderForm from './StoreSliderForm';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';

interface StoreSliderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (file: File | null) => void;
  errors: {[key: string]: string};
  isRTL: boolean;
  mode?: 'slider' | 'video';
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
  renderFooter?: React.ReactNode;
  saving?: boolean;
}

const StoreSliderDrawer: React.FC<StoreSliderDrawerProps> = ({ open, onClose, onSave, form, onFormChange, onImageChange, onFileChange, errors, isRTL, mode = 'slider', renderFooter, saving = false }) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`max-h-[85vh] bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className=" flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {mode === 'video'
              ? t('storeSlider.addVideo', 'إضافة فيديو')
              : t('storeSlider.addSlider', 'إضافة شريط ')}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className=" max-h-[85vh] overflow-y-auto p-4 flex-1 flex flex-col">
          <StoreSliderForm
            form={form}
            onFormChange={onFormChange}
            onImageChange={onImageChange}
            onFileChange={onFileChange}
            errors={errors}
            isRTL={isRTL}
            mode={mode}
          />
        </form>
        {/* Footer */}
        {renderFooter ? renderFooter : (
          <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
            <CustomButton
              color="white"
              textColor="primary"
              text={t('common.cancel')}
              action={onClose}
              bordercolor="primary"
              disabled={saving}
            />
            <CustomButton
              color="primary"
              textColor="white"
              text={saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t('common.save')}
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              icon={saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSliderDrawer;