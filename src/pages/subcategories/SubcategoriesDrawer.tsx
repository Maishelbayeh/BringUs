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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-lg flex flex-col transition-transform duration-300 transform`}
        style={{ [isRTL ? 'left' : 'right']: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <CustomSelect
              value={form.categoryId}
              onChange={e => onFormChange(e as any)}
              options={[
                { value: '', label: isRTL ? 'اختر الفئة' : 'Select Category' },
                ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))
              ]}
              isRTL={isRTL}
            />
            <SubcategoriesForm
              form={form}
              onFormChange={onFormChange}
              onImageChange={onImageChange}
              isRTL={isRTL}
            />
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-end space-x-3">
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
              action={() => onSubmit({} as React.FormEvent)}
              type="submit"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesDrawer; 