import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomTextArea from '../../../components/common/CustomTextArea';

interface CategoriesFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubcategory?: boolean;
  isRTL: boolean;
  categories?: { id: number; name: string }[];
}

const CategoriesForm: React.FC<CategoriesFormProps> = ({ form, onFormChange, onImageChange, isSubcategory, isRTL, categories }) => {
  // استخراج الفئات الرئيسية فقط
  // const mainCategories = categories ? categories.filter(cat => !('parentId' in cat) || cat.parentId === null) : [];
  // إيجاد اسم الفئة الرئيسية إذا كان parentId موجودًا
  const parentCategory = form.parentId !== null && categories ? categories.find(cat => String(cat.id) === String(form.parentId)) : null;
  return (
    <>
      {/* عرض اسم الفئة الرئيسية إذا كانت فئة فرعية */}
      {form.parentId !== null && parentCategory && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">{isRTL ? 'الفئة الرئيسية:' : 'Main Category:'}</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{parentCategory.name}</span>
        </div>
      )}
      {/* باقي الحقول */}
      <CustomInput
        label={isSubcategory ? (isRTL ? 'اسم الفئة الفرعية' : 'Subcategory Name') : (isRTL ? 'اسم الفئة' : 'Category Name')}
        name="name"
        value={form.name}
        onChange={onFormChange}
        required
        labelAlign={isRTL ? 'right' : 'left'}
      />
      <CustomTextArea
        label={isRTL ? 'الوصف' : 'Description'}
        value={form.description}
        onChange={e => onFormChange(e as any)}
      />
      <CustomFileInput
        label={isRTL ? 'الصورة' : 'Image'}
        id="image"
        value={form.image}
        onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)}
      />
      {form.image && (
        <img src={form.image} alt="preview" className="w-16 h-16 rounded-full object-cover border mt-2 self-start" style={{direction: isRTL ? 'rtl' : 'ltr'}} />
      )}
      <CustomInput
        label={isRTL ? 'الترتيب' : 'Order'}
        name="order"
        type="number"
        value={form.order}
        onChange={onFormChange}
        required
        labelAlign={isRTL ? 'right' : 'left'}
      />
      <CustomInput
        type="checkbox"
        id="visible"
        name="visible"
        checked={form.visible}
        onChange={onFormChange}
        label={isRTL ? 'مفعل' : 'Visible'}
        labelAlign={isRTL ? 'right' : 'left'}
        className="w-5 h-5 text-primary accent-primary"
      />
    </>
  );
};

export default CategoriesForm; 