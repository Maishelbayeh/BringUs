import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { getStoreId } from '../utils/storeUtils';
import categoryImage from '../assets/category.jpg';

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
      const url = `https://bringus-backend.onrender.com/api/categories/store/${STORE_ID}`;
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
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب التصنيفات';
      showError(errorMessage);
      throw err;
    }
  }, [hasLoaded, categories.length, showError]);

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
         await axios.put(`https://bringus-backend.onrender.com/api/categories/${editId}`, payload, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        //CONSOLE.log('Category updated successfully:', response.data);
        showSuccess('تم تعديل التصنيف بنجاح', 'نجح التحديث');
      } else {
         await axios.post('https://bringus-backend.onrender.com/api/categories', payload, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        //CONSOLE.log('Category created successfully:', response.data);
        showSuccess('تم إضافة التصنيف بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving category:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في البيانات');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حفظ التصنيف';
        showError(errorMessage, 'خطأ في الحفظ');
      }
      
      throw err;
    }
  };

  // حذف تصنيف
  const deleteCategory = async (categoryId: string | number) => {
    //CONSOLE.log('Deleting category with id:', categoryId);
    try {
      await axios.delete(`https://bringus-backend.onrender.com/api/categories/${categoryId}?storeId=${STORE_ID}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }); 
        
      //CONSOLE.log('Category deleted successfully:', response.data);
      showSuccess('تم حذف التصنيف بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting category:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في الحذف');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حذف التصنيف';
        showError(errorMessage, 'خطأ في الحذف');
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
      const res = await axios.post('https://bringus-backend.onrender.com/api/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      //CONSOLE.log('Image uploaded successfully:', res.data);
      showSuccess('تم رفع الصورة بنجاح', 'نجح رفع الصورة');
      return res.data.imageUrl;
    } catch (err: any) {
      //CONSOLE.error('Error uploading image:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في رفع الصورة: ${validationErrors}`, 'خطأ في رفع الصورة');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصورة';
        showError(errorMessage, 'خطأ في رفع الصورة');
      }
      
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
        showSuccess('هذا اختبار للتوست الناجح', 'اختبار التوست');
        //CONSOLE.log('Success toast called');
        
        setTimeout(() => {
          try {
            showError('هذا اختبار للتوست الفاشل', 'اختبار الخطأ');
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