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
  validationErrors?: { [key: string]: string }; // رسائل أخطاء الـ validation
}

// تم نقل جميع دوال الفالديشين إلى نظام الفالديشين العام في src/validation/categoryValidation.ts

const CategoriesForm: React.FC<CategoriesFormProps> = ({ form, onFormChange, onImageChange, isSubcategory, isRTL, categories, validationErrors = {} }) => {
  // Debug: طباعة قيمة الصورة
  //CONSOLE.log('CategoriesForm - form.image value:', form.image);
  //CONSOLE.log('CategoriesForm - form.image type:', typeof form.image);
  //CONSOLE.log('CategoriesForm - validation errors:', validationErrors);
  
  // استخراج الفئات الرئيسية فقط
  // const mainCategories = categories ? categories.filter(cat => !('parentId' in cat) || cat.parentId === null) : [];
  // إيجاد اسم الفئة الرئيسية إذا كان parentId موجودًا
  const parentCategory = form.parentId !== null && categories ? categories.find(cat => String(cat.id) === String(form.parentId)) : null;
  
  // دالة لعرض رسالة الخطأ
  const showError = (fieldName: string) => {
    const error = validationErrors[fieldName];
    console.log(`Showing error for field ${fieldName}:`, error);
    if (!error) return null;
    
    return (
      <div className={`text-red-500 text-xs mt-1 flex items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <span>{error}</span>
      </div>
    );
  };

  // دالة للحصول على تنسيق الخطأ للحقول
  const getErrorStyle = (fieldName: string) => {
    return validationErrors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  };

  return (
    <>
      {/* عرض اسم الفئة الرئيسية إذا كانت فئة فرعية */}
      {form.parentId !== null && parentCategory && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">{isRTL ? 'الفئة الرئيسية:' : 'Main Category:'}</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{parentCategory.name}</span>
        </div>
      )}
      {/* Grid لحقول الاسم والوصف */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* الاسم بالعربية */}
        <div>
          <CustomInput
            label={isRTL ? 'اسم الفئة (عربي)' : 'Category Name (Arabic)'}
            name="nameAr"
            value={form.nameAr}
            onChange={onFormChange}
            required
            className={getErrorStyle('nameAr')}
          />
          {showError('nameAr')}
        </div>
        {/* الاسم بالإنجليزية */}
        <div>
          <CustomInput
            label={isRTL ? 'اسم الفئة (إنجليزي)' : 'Category Name (English)'}
            name="nameEn"
            value={form.nameEn}
            onChange={onFormChange}
            required
            className={getErrorStyle('nameEn')}
          />
          {showError('nameEn')}
        </div>
        {/* الوصف بالعربية */}
        <div>
          <CustomTextArea
            label={isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
            name="descriptionAr"
            value={form.descriptionAr}
            onChange={onFormChange}
            className={getErrorStyle('descriptionAr')}
          />
          {showError('descriptionAr')}
        </div>
        {/* الوصف بالإنجليزية */}
        <div>
          <CustomTextArea
            label={isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
            name="descriptionEn"
            value={form.descriptionEn}
            onChange={onFormChange}
            className={getErrorStyle('descriptionEn')}
          />
          {showError('descriptionEn')}
        </div>
      </div>
      {/* الصورة */}
      <div className="mt-2">
        <CustomFileInput
          label={isRTL ? 'الصورة' : 'Image'}
          id="image"
          value={form.image}
          onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)}
        />
        {showError('image')}
        {form.image && (
          <img 
            src={typeof form.image === 'string' ? form.image : (form.image && typeof form.image === 'object' && (form.image as any).url ? (form.image as any).url : '')} 
            alt="preview" 
            className="w-16 h-16 rounded-full object-cover border mt-2 self-start" 
            style={{direction: isRTL ? 'rtl' : 'ltr'}}
            onError={(e) => {
              //CONSOLE.error('Image failed to load:', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
      {/* الترتيب والتفعيل */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {/* إظهار حقل التفعيل فقط في وضع التعديل */}
        {/* {form.id && (
          <div>
            <CustomCheckbox
              type="checkbox"
              id="visible"
              name="visible"
              checked={form.visible}
              onChange={onFormChange}
              label={isRTL ? 'مفعل' : 'Visible'}
              className={`w-5 h-5 text-primary accent-primary mt-6 ${getErrorStyle('visible')}`}
            />
            {showError('visible')}
          </div>
        )} */}
      </div>
      {/* {categories && categories.length > 0 && (
        <div className="mb-2 mt-2">
          <CustomSelect
            label={isRTL ? 'الفئة الرئيسية (اختياري)' : 'Main Category (optional)'}
            value={form.parentId !== undefined && form.parentId !== null ? String(form.parentId) : ''}
            onChange={onFormChange as any}
            options={[
              { value: '', label: isRTL ? 'بدون' : 'None' },
              ...categories
                .filter(cat => !('parentId' in cat) || cat.parentId === null)
                .map(cat => ({ value: String(cat.id), label: cat.name }))
            ]}
            className={getErrorStyle('parentId')}
          />
          {showError('parentId')}
        </div>
      )} */}
    </>
  );
};

export default CategoriesForm; 