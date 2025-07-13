import React from 'react';
import CustomButton from '../../../components/common/CustomButton';
import CategoriesForm, { validateCategoryForm } from './CategoriesForm';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import useCategories from '@/hooks/useCategories';
import { useToastContext } from '../../../contexts/ToastContext';

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

const STORE_ID_KEY = 'storeId';
const DEFAULT_STORE_ID = '686a719956a82bfcc93a2e2d';

const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onImageChange, onSubmit, isSubcategory, categories, allCategories }) => {
  const { t } = useTranslation();
  const { uploadCategoryImage } = useCategories();
  const { showError } = useToastContext();
  
  // حالة رسائل الخطأ
  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});

  // حفظ storeId في localStorage إذا لم يكن موجوداً
  React.useEffect(() => {
    if (!localStorage.getItem(STORE_ID_KEY)) {
      localStorage.setItem(STORE_ID_KEY, DEFAULT_STORE_ID);
    }
  }, []);

  // جلب storeId من localStorage
  const storeId = localStorage.getItem(STORE_ID_KEY) || DEFAULT_STORE_ID;

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
    console.log('handleSave called with form:', form);
    
    // تسطيح التصنيفات للـ validation
    const flattenedCategories = flattenCategoriesForValidation(allCategories || []);
    console.log('Flattened categories for validation:', flattenedCategories);
    
    // تنفيذ الـ validation أولاً
    const validation = validateCategoryForm(form, isRTL, flattenedCategories);
    
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
      // تعيين رسائل الخطأ في الحالة
      setValidationErrors(validation.errors);
      
      // عرض رسالة توست إضافية
      const errorMessages = Object.values(validation.errors).join(', ');
      showError(errorMessages, isRTL ? 'خطأ في البيانات' : 'Data Error');
      return;
    }
    
    // مسح رسائل الخطأ إذا كانت البيانات صحيحة
    setValidationErrors({});
    
    console.log('Validation passed, proceeding with form submission');
    
    // تحقق من الحقول المطلوبة
    if (!form.nameAr || !form.nameEn) {
      showError(isRTL ? 'يجب إدخال اسم الفئة بالعربية والإنجليزية' : 'Category name in Arabic and English is required', isRTL ? 'خطأ في البيانات' : 'Data Error');
      return;
    }
    
    // استخدام onSubmit callback بدلاً من إعادة تحميل الصفحة
    const formEvent = new Event('submit') as any;
    await onSubmit(formEvent);
  };

  // دالة لمسح رسائل الخطأ عند تغيير الحقول
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    
    // مسح رسالة الخطأ للحقل الذي تم تغييره
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // استدعاء الدالة الأصلية
    onFormChange(e);
  };

  // دالة إغلاق الدراور مع مسح رسائل الخطأ
  const handleClose = () => {
    setValidationErrors({});
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
              validationErrors={validationErrors}
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