import React from 'react';
import CustomButton from '../../../components/common/CustomButton';
import CategoriesForm from './CategoriesForm';
import { useTranslation } from 'react-i18next';
import useCategories from '@/hooks/useCategories';
import { useToastContext } from '../../../contexts/ToastContext';
import { useValidation } from '../../../hooks/useValidation';
import { categoryValidationSchema,  validateCategoryWithDuplicates } from '../../../validation/categoryValidation';
import { getStoreId } from '../../../utils/storeUtils';

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
  allCategories?: any[]; // قائمة التصنيفات الكاملة للـ validation
}

const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onImageChange, onSubmit, isSubcategory, categories, allCategories }) => {
  const { t } = useTranslation();
  const { uploadCategoryImage } = useCategories();
 
  
  // استخدام النظام العام للفالديشين
  const {
    errors,
    validateForm: validateFormData,
 
    clearAllErrors,
    setErrors,
  } = useValidation({
    schema: categoryValidationSchema,
    onValidationChange: (isValid) => {
      // يمكن إضافة منطق إضافي هنا
    },
  });

  // جلب storeId باستخدام الدالة المساعدة
  const storeId = getStoreId();

  // دالة رفع الصورة: ترفع دائماً إلى Cloudflare وتخزن الرابط الناتج
  const onImageChangeLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = await uploadCategoryImage(file);
      if (onFormChange) {
        onFormChange({ target: { name: 'image', value: url } } as any);
      }
    }
  };

  // دالة توليد slug من الاسم الإنجليزي
  function generateSlug(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-');
  }

  // عند عرض الصورة في الفورم
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '';
    return imageUrl; // إرجاع الرابط مباشرة
  };

  // دالة لتسطيح شجرة التصنيفات للـ validation
  const flattenCategoriesForValidation = (categories: any[]): any[] => {
    if (!Array.isArray(categories)) return [];
    let result: any[] = [];
    for (const cat of categories) {
      result.push({
        id: cat.id,
        _id: cat._id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        parentId: cat.parentId,
        parent: cat.parent
      });
      if ('children' in cat && Array.isArray((cat as any).children) && (cat as any).children.length > 0) {
        result = result.concat(flattenCategoriesForValidation((cat as any).children));
      }
    }
    return result;
  };

  // دالة الحفظ المعدلة
  const handleSave = async () => {
    //CONSOLE.log('handleSave called with form:', form);
    
    // تحضير بيانات الفورم للفالديشين
    const formData = {
      nameAr: form.nameAr || '',
      nameEn: form.nameEn || '',
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      image: form.image || undefined,
      order: form.order ? parseInt(form.order) : undefined,
      parentId: form.parentId,
      isActive: form.isActive !== undefined ? form.isActive : true,
      id: form.id || form._id,
    };
    
    // تسطيح التصنيفات للفالديشين
    const flattenedCategories = flattenCategoriesForValidation(allCategories || []);
    
    // تنفيذ الفالديشين الشامل مع التحقق من التكرار
    const validation = validateCategoryWithDuplicates(formData, flattenedCategories, t);
    
    if (!validation.isValid) {
      // عرض الأخطاء في الحقول مباشرة عبر النظام الجديد
      console.log('Validation errors:', validation.errors);
      setErrors(validation.errors);
      return;
    }
    
    // مسح الأخطاء إذا كان الفالديشين ناجح
    clearAllErrors();
    
    //CONSOLE.log('Validation passed, proceeding with form submission');
    
    // استخدام onSubmit callback بدلاً من إعادة تحميل الصفحة
    const formEvent = new Event('submit') as any;
    await onSubmit(formEvent);
  };

  // دالة لمسح رسائل الخطأ عند تغيير الحقول
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // استدعاء الدالة الأصلية أولاً
    onFormChange(e);
    
    // تنفيذ فالديشين real-time للحقل المحدد
    const updatedForm = { ...form, [name]: value };
    const formData = {
      nameAr: updatedForm.nameAr || '',
      nameEn: updatedForm.nameEn || '',
      descriptionAr: updatedForm.descriptionAr || undefined,
      descriptionEn: updatedForm.descriptionEn || undefined,
      image: updatedForm.image || undefined,
      order: updatedForm.order ? parseInt(updatedForm.order) : undefined,
      parentId: updatedForm.parentId,
      isActive: updatedForm.isActive !== undefined ? updatedForm.isActive : true,
      id: updatedForm.id || updatedForm._id,
    };
    
    // تنفيذ فالديشين سريع
    const flattenedCategories = flattenCategoriesForValidation(allCategories || []);
    const validation = validateCategoryWithDuplicates(formData, flattenedCategories, t);
    
    // تحديث أخطاء الحقل المحدد فقط
    if (validation.errors[name]) {
      console.log(`Field ${name} validation error:`, validation.errors[name]);
      setErrors({ ...errors, [name]: validation.errors[name] });
    } else {
      console.log(`Field ${name} validation passed`);
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // دالة إغلاق الدراور مع مسح رسائل الخطأ
  const handleClose = () => {
    clearAllErrors();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{title}</span>
          <button onClick={handleClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form (Scrollable) */}
        <div className="flex-1 overflow-y-auto max-h-[70vh]">
          <form className="flex flex-col p-4">
            <CategoriesForm
              form={{
                ...form,
                image: typeof form.image === 'string' ? form.image : (form.image && typeof form.image === 'object' && (form.image as any).url ? (form.image as any).url : '')
              }}
              onFormChange={handleFormChange}
              onImageChange={onImageChangeLocal}
              isSubcategory={isSubcategory}
              isRTL={isRTL}
              categories={categories}
              validationErrors={errors}
            />
          </form>
        </div>
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel')}
            action={handleClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save')}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesDrawer; 