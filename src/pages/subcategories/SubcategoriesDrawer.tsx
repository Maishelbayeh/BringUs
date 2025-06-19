import React from 'react';
import CustomButton from '../../components/common/CustomButton';
import CustomSelect from '../../components/common/CustomSelect';
import SubcategoriesForm from './SubcategoriesForm';
import { useTranslation } from 'react-i18next';

interface SubcategoriesDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories?: { id: number; name: string }[];
}

const SubcategoriesDrawer: React.FC<SubcategoriesDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onImageChange, onSubmit, categories = [] }) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{title}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
        
          <form onSubmit={onSubmit} className="flex flex-col p-4"> 
            <CustomSelect
              value={form.categoryId}
              onChange={e => onFormChange(e as any)}
              options={[
                { value: '', label: isRTL ? 'اختر الفئة' : 'Select Category' },
                ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))
              ]}
            />
            <SubcategoriesForm
              form={form}
              onFormChange={onFormChange}
              onImageChange={onImageChange}
              isRTL={isRTL}
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
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save')}
            type="submit"
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesDrawer; 