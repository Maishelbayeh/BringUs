import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

const STORE_ID = '686a719956a82bfcc93a2e2d'; // ثابت للاختبار، يمكن تعديله لاحقاً

const useProductLabel = () => {
  const [productLabels, setProductLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();

  // جلب جميع مواصفات المنتجات
  const fetchProductLabels = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && productLabels.length > 0) {
      console.log('Data already loaded, skipping API call');
      return productLabels;
    }

    try {
        setLoading(true);
      const url = `${BASE_URL}meta/stores/${STORE_ID}/product-labels`;
      const res = await axios.get(url);
      console.log('FETCHED PRODUCT LABELS FROM API:', res.data);
      setProductLabels(res.data);
      setHasLoaded(true); // تم تحميل البيانات
      return res.data;
    } catch (err: any) {
      console.error('Error fetching product labels:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب التصنيفات';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, productLabels.length, showError]);

  // إضافة أو تعديل وحدة
  const saveProductLabel = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    console.log('Saving product label with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    
    const payload: any = {
      nameAr: form.nameAr.trim(),
      nameEn: form.nameEn.trim(),
      descriptionAr: form.descriptionAr?.trim() || '',
      descriptionEn: form.descriptionEn?.trim() || '',
      isActive: form.isActive !== undefined ? form.isActive : true,
      
      store: STORE_ID,
    };
    

    console.log('Final payload to send:', payload);
    try {
      if (editId) {
        const response = await axios.put(`${BASE_URL}meta/product-labels/${editId}`, payload);
        console.log('Product label updated successfully:', response.data);
        showSuccess('تم تعديل التصنيف بنجاح', 'نجح التحديث');
      } else {
        const response = await axios.post(`${BASE_URL}meta/product-labels`, payload);
        console.log('Product label created successfully:', response.data);
        showSuccess('تم إضافة التصنيف بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchProductLabels(true);
      return true;
    } catch (err: any) {
      console.error('Error saving product label:', err);
      
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

  // حذف وحدة
  const deleteProductLabel = async (productLabelId: string | number) => {
    try {
      const response = await axios.delete(`${BASE_URL}meta/product-labels/${productLabelId}`);
      console.log('Product label deleted successfully:', response.data);
      showSuccess('تم حذف التصنيف بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchProductLabels(true);
      return true;
    } catch (err: any) {
      console.error('Error deleting product label:', err);
      
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

  // دالة التحقق من صحة البيانات
  const validateProductLabel = (form: any, isRTL: boolean = false) => {
    const errors: { [key: string]: string } = {};

    // التحقق من الوصف العربي
    if (!form.nameAr || form.nameAr.trim() === '') {
      errors.nameAr = isRTL ? 'الاسم بالعربية مطلوب' : 'Arabic name is required';
    } else if (form.nameAr.trim().length > 100) {
      errors.nameAr = isRTL ? 'الاسم بالعربية لا يمكن أن يتجاوز 100 حرف' : 'Arabic name cannot exceed 100 characters';
    }
  
    // التحقق من الوصف الإنجليزي
    if (!form.nameEn || form.nameEn.trim() === '') {
      errors.nameEn = isRTL ? 'الاسم بالانجليزية مطلوب' : 'English name is required';
    } else if (form.nameEn.trim().length > 100) {
      errors.nameEn = isRTL ? 'الاسم بالانجليزية لا يمكن أن يتجاوز 100 حرف' : 'English name cannot exceed 100 characters';
    }

    // التحقق من عدم تكرار الاسم في نفس المستوى
    // نتجاهل التصنيف الحالية عند التعديل
    const currentProductLabelId = form.id || form._id;
    const existingProductLabel = productLabels.find(productLabel => {
      const productLabelId = productLabel._id || productLabel.id;
      // إذا كان هذا هو نفس التصنيف التي نعدلها، نتجاهلها
      if (currentProductLabelId && productLabelId === currentProductLabelId) {
        return false;
      }
      // التحقق من التكرار بالاسمين العربي والإنجليزي
      return productLabel.nameAr === form.nameAr.trim() && productLabel.nameEn === form.nameEn.trim();
    });
    
    if (existingProductLabel) {
      const errorMsg = isRTL ? 'هذه التصنيف موجودة مسبقاً' : 'This product label already exists';
      errors.nameAr = errorMsg;
      errors.nameEn = errorMsg;
    }

    return errors;
  };

  return {
    productLabels,
    setProductLabels,
    loading,
    fetchProductLabels,
    saveProductLabel,
    deleteProductLabel,
    validateProductLabel,
  };
};

export default useProductLabel; 