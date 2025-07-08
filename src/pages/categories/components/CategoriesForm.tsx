import React from 'react';
import CustomInput from '../../../components/common/CustomInput';
import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomTextArea from '../../../components/common/CustomTextArea';
import CustomSelect from '../../../components/common/CustomSelect';

interface CategoriesFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubcategory?: boolean;
  isRTL: boolean;
  categories?: { id: number; name: string }[];
  validationErrors?: { [key: string]: string }; // رسائل أخطاء الـ validation
}

// دالة مساعدة للتحقق من تكرار الاسم
export const checkDuplicateName = (name: string, categories: any[], currentId?: string | number | null, parentId?: string | number | null) => {
  if (!name || name.trim() === '') return false;
  
  return categories.some(cat => {
    // تجاهل الفئة الحالية عند التعديل
    if (currentId && (cat.id === currentId || cat._id === currentId)) {
      return false;
    }
    
    // التحقق من نفس المستوى (نفس parentId)
    const catParentId = cat.parentId || (cat.parent && cat.parent.id) || null;
    if (catParentId !== parentId) {
      return false;
    }
    
    // التحقق من الاسم العربي والإنجليزي (حساسية لحالة الأحرف)
    return (cat.nameAr && cat.nameAr.trim().toLowerCase() === name.trim().toLowerCase()) || 
           (cat.nameEn && cat.nameEn.trim().toLowerCase() === name.trim().toLowerCase());
  });
};

// دالة التحقق من صحة البيانات
export const validateCategoryForm = (form: any, isRTL: boolean, categories: any[] = []) => {
  const errors: { [key: string]: string } = {};

  // التحقق من الاسم العربي
  if (!form.nameAr || form.nameAr.trim() === '') {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية مطلوب' : 'Category name in Arabic is required';
  } else if (form.nameAr.trim().length < 2) {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية يجب أن يكون على الأقل حرفين' : 'Category name in Arabic must be at least 2 characters';
  } else if (form.nameAr.trim().length > 50) {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية يجب أن لا يتجاوز 50 حرف' : 'Category name in Arabic must not exceed 50 characters';
  } else if (!/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/.test(form.nameAr.trim())) {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية يجب أن يحتوي على أحرف عربية فقط' : 'Category name in Arabic must contain only Arabic characters';
  } else if (/^\s+$/.test(form.nameAr.trim())) {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية لا يمكن أن يكون مسافات فقط' : 'Category name in Arabic cannot be only spaces';
  }

  // التحقق من الاسم الإنجليزي
  if (!form.nameEn || form.nameEn.trim() === '') {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية مطلوب' : 'Category name in English is required';
  } else if (form.nameEn.trim().length < 2) {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية يجب أن يكون على الأقل حرفين' : 'Category name in English must be at least 2 characters';
  } else if (form.nameEn.trim().length > 50) {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية يجب أن لا يتجاوز 50 حرف' : 'Category name in English must not exceed 50 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(form.nameEn.trim())) {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية يجب أن يحتوي على أحرف إنجليزية فقط' : 'Category name in English must contain only English characters';
  } else if (/^\s+$/.test(form.nameEn.trim())) {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية لا يمكن أن يكون مسافات فقط' : 'Category name in English cannot be only spaces';
  }

  // التحقق من الوصف العربي (اختياري)
  if (form.descriptionAr && form.descriptionAr.trim() !== '') {
    if (form.descriptionAr.trim().length > 500) {
      errors.descriptionAr = isRTL ? 'الوصف بالعربية يجب أن لا يتجاوز 500 حرف' : 'Description in Arabic must not exceed 500 characters';
    } else if (!/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\.,!?;:()\-_]+$/.test(form.descriptionAr.trim())) {
      errors.descriptionAr = isRTL ? 'الوصف بالعربية يجب أن يحتوي على أحرف عربية وأرقام وعلامات ترقيم فقط' : 'Description in Arabic must contain only Arabic characters, numbers, and punctuation';
    }
  }

  // التحقق من الوصف الإنجليزي (اختياري)
  if (form.descriptionEn && form.descriptionEn.trim() !== '') {
    if (form.descriptionEn.trim().length > 500) {
      errors.descriptionEn = isRTL ? 'الوصف بالإنجليزية يجب أن لا يتجاوز 500 حرف' : 'Description in English must not exceed 500 characters';
    } else if (!/^[a-zA-Z\s\d\.,!?;:()\-_]+$/.test(form.descriptionEn.trim())) {
      errors.descriptionEn = isRTL ? 'الوصف بالإنجليزية يجب أن يحتوي على أحرف إنجليزية وأرقام وعلامات ترقيم فقط' : 'Description in English must contain only English characters, numbers, and punctuation';
    }
  }

  // التحقق من الصورة (اختياري)
  if (form.image) {
    const imageUrl = typeof form.image === 'string' ? form.image : (form.image && typeof form.image === 'object' && (form.image as any).url ? (form.image as any).url : '');
    if (imageUrl && !imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      errors.image = isRTL ? 'يجب أن تكون الصورة رابط صحيح بصيغة jpg, jpeg, png, gif, webp, أو svg' : 'Image must be a valid URL with jpg, jpeg, png, gif, webp, or svg format';
    }
  }

  // التحقق من الترتيب
  if (form.order !== undefined && form.order !== null) {
    const order = parseInt(form.order);
    if (isNaN(order) || order < 1 || order > 999) {
      errors.order = isRTL ? 'الترتيب يجب أن يكون رقم بين 1 و 999' : 'Order must be a number between 1 and 999';
    }
  }

  // التحقق من الفئة الرئيسية (لا يمكن أن تكون نفس الفئة)
  if (form.parentId && form.id && form.parentId === form.id) {
    errors.parentId = isRTL ? 'لا يمكن أن تكون الفئة الرئيسية هي نفس الفئة' : 'Parent category cannot be the same as the current category';
  }

  // التحقق من عدم تكرار الاسم في نفس المستوى
  if (checkDuplicateName(form.nameAr, categories, form.id, form.parentId)) {
    errors.nameAr = isRTL ? 'اسم الفئة بالعربية يجب أن يكون مميزاً في نفس المستوى' : 'Category name in Arabic must be unique within the same level';
  }
  
  if (checkDuplicateName(form.nameEn, categories, form.id, form.parentId)) {
    errors.nameEn = isRTL ? 'اسم الفئة بالإنجليزية يجب أن يكون مميزاً في نفس المستوى' : 'Category name in English must be unique within the same level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const CategoriesForm: React.FC<CategoriesFormProps> = ({ form, onFormChange, onImageChange, isSubcategory, isRTL, categories, validationErrors = {} }) => {
  // Debug: طباعة قيمة الصورة
  console.log('CategoriesForm - form.image value:', form.image);
  console.log('CategoriesForm - form.image type:', typeof form.image);
  console.log('CategoriesForm - validation errors:', validationErrors);
  
  // استخراج الفئات الرئيسية فقط
  // const mainCategories = categories ? categories.filter(cat => !('parentId' in cat) || cat.parentId === null) : [];
  // إيجاد اسم الفئة الرئيسية إذا كان parentId موجودًا
  const parentCategory = form.parentId !== null && categories ? categories.find(cat => String(cat.id) === String(form.parentId)) : null;
  
  // دالة لعرض رسالة الخطأ
  const showError = (fieldName: string) => {
    const error = validationErrors[fieldName];
    if (!error) return null;
    
    return (
      <div className={`text-red-500 text-xs mt-1 flex items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
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
              console.error('Image failed to load:', e.currentTarget.src);
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