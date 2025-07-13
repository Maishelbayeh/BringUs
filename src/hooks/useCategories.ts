import { useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useToastContext } from '../contexts/ToastContext';

const STORE_ID = '686a719956a82bfcc93a2e2d'; // ثابت للاختبار، يمكن تعديله لاحقاً

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
  
  // console.log('useCategories hook initialized with toast functions:', { 
  //   showSuccess: typeof showSuccess, 
  //   showError: typeof showError,
  //   showSuccessFunction: showSuccess,
  //   showErrorFunction: showError
  // });

  // جلب جميع التصنيفات كشجرة
  const fetchCategories = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && categories.length > 0) {
      // console.log('Categories already loaded, skipping API call');
      return categories;
    }

    
    try {
      const url = `http://localhost:5001/api/categories/store/${STORE_ID}`;
      const res = await axios.get(url);
      console.log('FETCHED CATEGORIES FROM API:', res.data.data);
      const treeData = buildCategoryTree(res.data.data);
      setCategories(treeData);
      setHasLoaded(true); // تم تحميل البيانات
      // لا نعرض توست عند جلب البيانات الأولي
      return res.data.data;
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب التصنيفات';
      showError(errorMessage);
      throw err;
    }
  }, [hasLoaded, categories.length, showError]);

  // إضافة أو تعديل تصنيف
  const saveCategory = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    console.log('Saving category with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    
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
      image: form.image || '',
      isActive: form.visible !== undefined ? form.visible : true,
      sortOrder: form.order || 1,
    };
    
    // إضافة parent فقط إذا كان له قيمة صحيحة
    if (form.parentId && form.parentId !== '' && form.parentId !== null && form.parentId !== 'null') {
      payload.parent = form.parentId;
    }
    
    console.log('Final payload to send:', payload);
    try {
      if (editId) {
        const response = await axios.put(`http://localhost:5001/api/categories/${editId}`, payload);
        console.log('Category updated successfully:', response.data);
        showSuccess('تم تعديل التصنيف بنجاح', 'نجح التحديث');
      } else {
        const response = await axios.post('http://localhost:5001/api/categories', payload);
        console.log('Category created successfully:', response.data);
        showSuccess('تم إضافة التصنيف بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      console.error('Error saving category:', err);
      
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
    try {
      const response = await axios.delete(`http://localhost:5001/api/categories/${categoryId}?storeId=${STORE_ID}`);
      console.log('Category deleted successfully:', response.data);
      showSuccess('تم حذف التصنيف بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchCategories(true);
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      
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
      const res = await axios.post('http://localhost:5001/api/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Image uploaded successfully:', res.data);
      showSuccess('تم رفع الصورة بنجاح', 'نجح رفع الصورة');
      return res.data.imageUrl;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      
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
      console.log('Testing toast functions...');
      console.log('showSuccess function:', showSuccess);
      console.log('showError function:', showError);
      
      try {
        showSuccess('هذا اختبار للتوست الناجح', 'اختبار التوست');
        console.log('Success toast called');
        
        setTimeout(() => {
          try {
            showError('هذا اختبار للتوست الفاشل', 'اختبار الخطأ');
            console.log('Error toast called');
          } catch (error) {
            console.error('Error calling showError:', error);
          }
        }, 2000);
      } catch (error) {
        console.error('Error calling showSuccess:', error);
      }
    },
  };
};

export default useCategories; 