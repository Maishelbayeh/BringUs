import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';


const useProductSpecifications = () => {
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();
 

  // جلب جميع مواصفات المنتجات
  const fetchSpecifications = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && specifications.length > 0) {
      // //CONSOLE.log('Data already loaded, skipping API call');
      return specifications;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}meta/product-specifications/by-store?storeId=${getStoreId()}`;
      //CONSOLE.log('🔍 Fetching specifications from:', url);
      const res = await axios.get(url);
      //CONSOLE.log('🔍 Raw API response:', res.data);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      //CONSOLE.log('🔍 Processed specifications data:', data);
      setSpecifications(data);
      setHasLoaded(true); // تم تحميل البيانات
      return data;
    } catch (err: any) {
      //CONSOLE.error('Error fetching specifications:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب مواصفات المنتجات';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, showError]); // إزالة specifications.length من dependencies

  // إضافة أو تعديل مواصفة منتج
  const saveSpecification = async (form: any, editId?: string | number | null) => {
    console.log('🔄 Starting saveSpecification...');
    console.log('📝 Form data:', form);
    console.log('🔧 Edit ID:', editId);
    
    const payload: any = {
      titleAr: form.titleAr?.trim(),
      titleEn: form.titleEn?.trim(),
      values: form.values || [],
      sortOrder: form.sortOrder || 0,
      isActive: form.isActive !== undefined ? form.isActive : true, // إعادة تفعيل
              storeId: getStoreId(), // إرسال storeId في كل الحالات
    };
    
    // إضافة التصنيف فقط إذا كان محدداً
    if (form.categoryId && form.categoryId !== '') {
      payload.category = form.categoryId;
    }
    
    //CONSOLE.log('Final payload to send:', payload);
    try {
      if (editId) {
        console.log('🔄 Sending PUT request to:', `${BASE_URL}meta/product-specifications/${editId}`);
        await axios.put(`${BASE_URL}meta/product-specifications/${editId}`, payload);
        //CONSOLE.log('Specification updated successfully:', response.data);
        showSuccess('تم تعديل مواصفة المنتج بنجاح', 'نجح التحديث');
      } else {
        console.log('🔄 Sending POST request to:', `${BASE_URL}meta/product-specifications`);
        await axios.post(`${BASE_URL}meta/product-specifications`, payload);
        //CONSOLE.log('Specification created successfully:', response.data);
        showSuccess('تم إضافة مواصفة المنتج بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving specification:', err);
      
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
      await axios.delete(`${BASE_URL}meta/product-specifications/${specificationId}`);
      //CONSOLE.log('Specification deleted successfully:', response.data);
      showSuccess('تم حذف مواصفة المنتج بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting specification:', err);
      
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

  return {
    specifications,
    setSpecifications,
    loading,
    fetchSpecifications,
    saveSpecification,
    deleteSpecification,
  };
};

export default useProductSpecifications; 