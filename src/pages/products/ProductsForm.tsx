import React from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';

interface ProductsFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
}

const ProductsForm: React.FC<ProductsFormProps> = ({ form, onFormChange, onImageChange, isRTL, categories = [], subcategories = [] }) => (
  <>
    <select name="categoryId" value={form.categoryId} onChange={onFormChange} className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
      <option value="">{isRTL ? 'اختر الفئة' : 'Select Category'}</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
    <select name="subcategoryId" value={form.subcategoryId} onChange={onFormChange} className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
      <option value="">{isRTL ? 'اختر الفئة الفرعية (اختياري)' : 'Select Subcategory (optional)'}</option>
      {subcategories.map(sub => (
        <option key={sub.id} value={sub.id}>{sub.name}</option>
      ))}
    </select>
    <CustomInput label={isRTL ? 'اسم المنتج' : 'Product Name'} name="name" value={form.name} onChange={onFormChange} required  />
    <CustomInput label={isRTL ? 'الوصف' : 'Description'} name="description" value={form.description} onChange={onFormChange} required  />
    <CustomFileInput label={isRTL ? 'الصورة' : 'Image'} id="image" value={form.image} onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)} />
  </>
);

export default ProductsForm; 