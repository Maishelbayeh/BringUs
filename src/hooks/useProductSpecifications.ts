import { useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

const STORE_ID = '686a719956a82bfcc93a2e2d'; // ثابت للاختبار، يمكن تعديله لاحقاً

const useProductSpecifications = () => {
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();

  // جلب جميع مواصفات المنتجات
  const fetchSpecifications = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && specifications.length > 0) {
      // console.log('Data already loaded, skipping API call');
      return specifications;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}meta/product-specifications/by-store?storeId=${STORE_ID}`;
      const res = await axios.get(url);
      // console.log('FETCHED SPECIFICATIONS FROM API:', res.data);
      setSpecifications(res.data);
      setHasLoaded(true); // تم تحميل البيانات
      return res.data;
    } catch (err: any) {
      console.error('Error fetching specifications:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب مواصفات المنتجات';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, specifications.length, showError]);

  // إضافة أو تعديل مواصفة منتج
  const saveSpecification = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    console.log('Saving specification with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    
    const payload: any = {
      descriptionAr: form.descriptionAr.trim(),
      descriptionEn: form.descriptionEn.trim(),
      store: STORE_ID,
      sortOrder: form.sortOrder || 0,
    };
    
    // إضافة التصنيف فقط إذا كان محدداً
    if (form.categoryId && form.categoryId !== '') {
      payload.category = form.categoryId;
    }
    
    console.log('Final payload to send:', payload);
    try {
      if (editId) {
        const response = await axios.put(`${BASE_URL}meta/product-specifications/${editId}`, payload);
        console.log('Specification updated successfully:', response.data);
        showSuccess('تم تعديل مواصفة المنتج بنجاح', 'نجح التحديث');
      } else {
        const response = await axios.post(`${BASE_URL}meta/product-specifications`, payload);
        console.log('Specification created successfully:', response.data);
        showSuccess('تم إضافة مواصفة المنتج بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      console.error('Error saving specification:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في البيانات');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حفظ مواصفة المنتج';
        showError(errorMessage, 'خطأ في الحفظ');
      }
      
      throw err;
    }
  };

  // حذف مواصفة منتج
  const deleteSpecification = async (specificationId: string | number) => {
    try {
      const response = await axios.delete(`${BASE_URL}meta/product-specifications/${specificationId}`);
      console.log('Specification deleted successfully:', response.data);
      showSuccess('تم حذف مواصفة المنتج بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      console.error('Error deleting specification:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في الحذف');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حذف مواصفة المنتج';
        showError(errorMessage, 'خطأ في الحذف');
      }
      
      throw err;
    }
  };

  // دالة التحقق من صحة البيانات
  const validateSpecification = (form: any, isRTL: boolean = false) => {
    const errors: { [key: string]: string } = {};

    // التحقق من الوصف العربي
    if (!form.descriptionAr || form.descriptionAr.trim() === '') {
      errors.descriptionAr = isRTL ? 'الوصف العربي مطلوب' : 'Arabic description is required';
    } else if (form.descriptionAr.trim().length > 100) {
      errors.descriptionAr = isRTL ? 'الوصف العربي لا يمكن أن يتجاوز 100 حرف' : 'Arabic description cannot exceed 100 characters';
    }

    // التحقق من الوصف الإنجليزي
    if (!form.descriptionEn || form.descriptionEn.trim() === '') {
      errors.descriptionEn = isRTL ? 'الوصف الإنجليزي مطلوب' : 'English description is required';
    } else if (form.descriptionEn.trim().length > 100) {
      errors.descriptionEn = isRTL ? 'الوصف الإنجليزي لا يمكن أن يتجاوز 100 حرف' : 'English description cannot exceed 100 characters';
    }

    // التحقق من عدم تكرار الاسم في نفس المستوى
    const existingSpec = specifications.find(spec => 
      spec.id !== form.id && 
      spec.descriptionAr === form.descriptionAr.trim() && 
      spec.descriptionEn === form.descriptionEn.trim()
    );
    
    if (existingSpec) {
      errors.descriptionAr = isRTL ? 'هذه المواصفة موجودة مسبقاً' : 'This specification already exists';
      errors.descriptionEn = isRTL ? 'هذه المواصفة موجودة مسبقاً' : 'This specification already exists';
    }

    return errors;
  };

  return {
    specifications,
    setSpecifications,
    loading,
    fetchSpecifications,
    saveSpecification,
    deleteSpecification,
    validateSpecification,
  };
};

export default useProductSpecifications; 