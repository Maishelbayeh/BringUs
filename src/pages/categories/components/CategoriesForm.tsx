import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomFileInput from '../../../components/common/CustomFileInput';

interface CategoriesFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubcategory?: boolean;
  isRTL: boolean;
  categories?: { id: number; name: string }[];
}

const CategoriesForm: React.FC<CategoriesFormProps> = ({ form, onFormChange, onImageChange, isSubcategory, isRTL, categories }) => (
  <>
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
      onChange={onFormChange}
      required
    />
    <CustomInput
      label={isRTL ? 'الوصف' : 'Description'}
      name="description"
      value={form.description}
      onChange={onFormChange}
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
  </>
);

export default CategoriesForm; 