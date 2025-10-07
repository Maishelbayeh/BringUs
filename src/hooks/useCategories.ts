import { useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../contexts/ToastContext';
import { getStoreId } from '../utils/storeUtils';
import categoryImage from '../assets/category.jpg';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

function buildCategoryTree(flatCategories: any[]): any[] {
  if (!Array.isArray(flatCategories)) return [];
  const idMap: { [key: string]: any } = {};
  const tree: any[] = [];
  flatCategories.forEach(cat => {
    idMap[cat.id] = { ...cat, children: [] };
  });
  flatCategories.forEach(cat => {
    if (cat.parent && typeof cat.parent === 'object' && cat.parent.id && idMap[cat.parent.id]) {
      idMap[cat.parent.id].children.push(idMap[cat.id]);
    } else if (!cat.parent || cat.parent === null) {
      tree.push(idMap[cat.id]);
    }
  });
  return tree;
}

const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  

const STORE_ID = getStoreId() || '';

  // //CONSOLE.log('useCategories hook initialized with toast functions:', { 
  //   showSuccess: typeof showSuccess, 
  //   showError: typeof showError,
  //   showSuccessFunction: showSuccess,
  //   showErrorFunction: showError
  // });

  // جلب جميع التصنيفات كشجرة
  const fetchCategories = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && categories.length > 0) {
      // //CONSOLE.log('Categories already loaded, skipping API call');
      return categories;
    }

    
    try {
      const url = `https://bringus-backend.onrender.com/categories/store/${STORE_ID}`;
      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // //CONSOLE.log('FETCHED CATEGORIES FROM API:', res.data.data);
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const treeData = buildCategoryTree(data);
      setCategories(treeData);
      setHasLoaded(true); // تم تحميل البيانات
      // لا نعرض توست عند جلب البيانات الأولي
      return data;
    } catch (err: any) {
      //CONSOLE.error('Error fetching categories:', err);
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب التصنيفات' : 'Error Fetching Categories',
        message: isRTL ? 'فشل في جلب قائمة التصنيفات' : 'Failed to fetch categories list'
      });
      showError(errorMsg.message);
      throw err;
    }
  }, [hasLoaded, categories.length, showError, t]);

  // إضافة أو تعديل تصنيف
  const saveCategory = async (form: any, editId?: string | number | null, _isRTL: boolean = false) => {
    //CONSOLE.log('Saving category with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    
    // صورة افتراضية للكاتيجوري
    const DEFAULT_CATEGORY_IMAGE = categoryImage;
    
    console.log('Category image:', form.image ? 'User uploaded' : 'Using default', form.image || DEFAULT_CATEGORY_IMAGE);
    
    // توليد slug تلقائياً من الاسم الإنجليزي إذا لم يكن موجوداً
    const slug = form.slug && form.slug.trim() !== ''
      ? form.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : (form.nameEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // معالجة parent - إذا كان فارغ أو null، لا نرسله
    const payload: any = {
      nameAr: form.nameAr.trim(),
      nameEn: form.nameEn.trim(),
      slug,
      descriptionAr: form.descriptionAr ? form.descriptionAr.trim() : '',
      descriptionEn: form.descriptionEn ? form.descriptionEn.trim() : '',
      storeId: STORE_ID,
      icon: form.icon || '',
      image: form.image || DEFAULT_CATEGORY_IMAGE, // استخدام الصورة الافتراضية إذا لم يرفع المستخدم صورة
      isActive: form.visible !== undefined ? form.visible : true,
      sortOrder: form.order || 1,
    };
    
    // إضافة parent فقط إذا كان له قيمة صحيحة
    if (form.parentId && form.parentId !== '' && form.parentId !== null && form.parentId !== 'null') {
      payload.parent = form.parentId;
    }
    
    //CONSOLE.log('Final payload to send:', payload);
    try {
      if (editId) {
         await axios.put(`https://bringus-backend.onrender.com/categories/${editId}`, payload, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        //CONSOLE.log('Category updated successfully:', response.data);
        showSuccess(t('categories.success.updateSuccess'), t('general.success'));
      } else {
         await axios.post('https://bringus-backend.onrender.com/categories', payload, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        //CONSOLE.log('Category created successfully:', response.data);
        showSuccess(t('categories.success.createSuccess'), t('general.success'));
      }
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving category:', err);
      
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حفظ التصنيف' : 'Error Saving Category',
        message: isRTL ? 'فشل في حفظ التصنيف' : 'Failed to save category'
      });
      showError(errorMsg.message, t('general.error'));
      throw err;
    }
  };

  // حذف تصنيف
  const deleteCategory = async (categoryId: string | number) => {
    //CONSOLE.log('Deleting category with id:', categoryId);
    try {
      await axios.delete(`https://bringus-backend.onrender.com/categories/${categoryId}?storeId=${STORE_ID}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }); 
        
      //CONSOLE.log('Category deleted successfully:', response.data);
      showSuccess(t('categories.success.deleteSuccess'), t('general.success'));
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting category:', err);
      
      // Check if this is a "category in use" error with detailed information
      if (err?.response?.data?.details?.connectedProducts) {
        const errorMessage = isRTL && err.response.data.messageAr 
          ? err.response.data.messageAr 
          : err.response.data.message || err.response.data.error;
        
        showError(errorMessage, isRTL ? 'خطأ في حذف التصنيف' : 'Error Deleting Category');
      } else {
        const errorMsg = getErrorMessage(err, isRTL, {
          title: isRTL ? 'خطأ في حذف التصنيف' : 'Error Deleting Category',
          message: isRTL ? 'فشل في حذف التصنيف' : 'Failed to delete category'
        });
        showError(errorMsg.message, t('general.error'));
      }
      
      throw err;
    }
  };

  // رفع صورة التصنيف
  const uploadCategoryImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', STORE_ID);
      const res = await axios.post('https://bringus-backend.onrender.com/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      //CONSOLE.log('Image uploaded successfully:', res.data);
      showSuccess(t('categories.success.uploadImageSuccess'), t('general.success'));
      return res.data.imageUrl;
    } catch (err: any) {
      //CONSOLE.error('Error uploading image:', err);
      
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في رفع الصورة' : 'Error Uploading Image',
        message: isRTL ? 'فشل في رفع صورة التصنيف' : 'Failed to upload category image'
      });
      showError(errorMsg.message, t('general.error'));
      throw err;
    }
  };

  return {
    categories,
    setCategories,
    fetchCategories,
    saveCategory,
    deleteCategory,
    uploadCategoryImage,
    // دالة اختبار للتوست
    testToast: () => {
      //CONSOLE.log('Testing toast functions...');
      //CONSOLE.log('showSuccess function:', showSuccess);
      //CONSOLE.log('showError function:', showError);
      
      try {
        showSuccess(t('general.success'), t('general.success'));
        //CONSOLE.log('Success toast called');
        
        setTimeout(() => {
          try {
            showError(t('general.error'), t('general.error'));
            //CONSOLE.log('Error toast called');
          } catch (error) {
            //CONSOLE.error('Error calling showError:', error);
          }
        }, 2000);
      } catch (error) {
        //CONSOLE.error('Error calling showSuccess:', error);
      }
    },
  };
};

export default useCategories; 