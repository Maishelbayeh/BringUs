import React from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';

interface SubcategoriesFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
}

const SubcategoriesForm: React.FC<SubcategoriesFormProps> = ({ form, onFormChange, onImageChange, isRTL }) => (
  <>
    <CustomInput label={isRTL ? 'اسم الفئة الفرعية' : 'Subcategory Name'} name="name" value={form.name} onChange={onFormChange} required labelAlign={isRTL ? 'right' : 'left'} />
    <CustomInput label={isRTL ? 'الوصف' : 'Description'} name="description" value={form.description} onChange={onFormChange} required labelAlign={isRTL ? 'right' : 'left'} />
    <CustomFileInput label={isRTL ? 'الصورة' : 'Image'} id="image" value={form.image} onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)} />
  </>
);

export default SubcategoriesForm; 