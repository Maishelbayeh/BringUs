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
  isRTL: boolean;
  mode?: 'slider' | 'video';
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
  renderFooter?: React.ReactNode;
}

const StoreSliderDrawer: React.FC<StoreSliderDrawerProps> = ({ open, onClose, onSave, form, onFormChange, onImageChange, isRTL, mode = 'slider', categories = [], subcategories = [], renderFooter }) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{t('sideBar.storeSlider')}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col">
          <StoreSliderForm
            form={form}
            onFormChange={onFormChange}
            onImageChange={onImageChange}
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
            />
            <CustomButton
              color="primary"
              textColor="white"
              text={t('common.save')}
              type="submit"
              onClick={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSliderDrawer;