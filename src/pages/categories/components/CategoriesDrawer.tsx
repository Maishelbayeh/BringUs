import React from 'react';
import CustomButton from '../../../components/common/CustomButton';
import CustomInput from '../../../components/common/CustomInput';
import CustomFileInput from '../../../components/common/CustomFileInput';

interface CategoriesDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubcategory?: boolean;
  categories?: { id: number; name: string }[];
}

const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onImageChange, onSubmit, isSubcategory, categories }) => {
  if (!open) return null;

  const handleInputChange = (name: string, value: string) => {
    onFormChange({
      target: { name, value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-lg p-6 flex flex-col gap-4 transition-transform duration-300 transform`}
        style={{ [isRTL ? 'left' : 'right']: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        {isSubcategory && categories ? (
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={onFormChange}
            className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">{isRTL ? 'اختر الفئة الرئيسية' : 'Select Category'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        ) : null}
        <CustomInput
          label={isSubcategory ? (isRTL ? 'اسم الفئة الفرعية' : 'Subcategory Name') : (isRTL ? 'اسم الفئة' : 'Category Name')}
          name="name"
          value={form.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          labelAlign={isRTL ? 'right' : 'left'}
        />
        <CustomInput
          label={isRTL ? 'الوصف' : 'Description'}
          name="description"
          value={form.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          labelAlign={isRTL ? 'right' : 'left'}
        />
        <CustomFileInput
          label={isRTL ? 'الصورة' : 'Image'}
          id="image"
          value={form.image}
          onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)}
          labelAlign={isRTL ? 'right' : 'left'}
        />
        <div className="flex gap-2 mt-2">
          <CustomButton
            color="primary"
            text={isRTL ? 'حفظ' : 'Save'}
            type="submit"
            onClick={onSubmit as any}
            style={{ flex: 1 }}
          />
          <CustomButton
            color="white"
            text={isRTL ? 'إلغاء' : 'Cancel'}
            textColor="primary"
            onClick={onClose}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesDrawer; 