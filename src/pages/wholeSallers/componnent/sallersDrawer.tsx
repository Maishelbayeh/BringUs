import React from 'react';
import SallersForm from './SallersForm';
import CustomButton from '../../../components/common/CustomButton';
import { useTranslation } from 'react-i18next';
//-------------------------------------------- SallersDrawerProps -------------------------------------------
interface SallersDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  form?: any;
  onFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

const SallersDrawer: React.FC<SallersDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onSubmit }) => {
  const { t } = useTranslation();
  if (!open) return null;
//-------------------------------------------- return -------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
{/* ------------------------------------------- Header ------------------------------------------- */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{title}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
{/* ------------------------------------------- Form ------------------------------------------- */}
        <form onSubmit={onSubmit} className="p-4 flex-1 flex flex-col">
          {form && onFormChange && <SallersForm form={form} onFormChange={onFormChange} isRTL={isRTL} />}
        </form>
{/* ------------------------------------------- Footer ------------------------------------------- */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'Cancel'}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save') || 'Save'}
            type="submit"
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default SallersDrawer;
