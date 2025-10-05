import { useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';


const useProductSpecifications = () => {
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();
  const { t } = useTranslation();
 

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
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('products.errors.fetchError');
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, showError, t]); // إزالة specifications.length من dependencies

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
        showSuccess(t('products.success.updateSuccess'), t('general.success'));
      } else {
        console.log('🔄 Sending POST request to:', `${BASE_URL}meta/product-specifications`);
        await axios.post(`${BASE_URL}meta/product-specifications`, payload);
        //CONSOLE.log('Specification created successfully:', response.data);
        showSuccess(t('products.success.createSuccess'), t('general.success'));
      }
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving specification:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`${t('products.errors.validationError')}: ${validationErrors}`, t('general.error'));
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('products.errors.updateError');
        showError(errorMessage, t('products.errors.saveError'));
      }
      
      throw err;
    }
  };

  // حذف مواصفة منتج
  const deleteSpecification = async (specificationId: string | number) => {
    try {
      await axios.delete(`${BASE_URL}meta/product-specifications/${specificationId}`);
      //CONSOLE.log('Specification deleted successfully:', response.data);
      showSuccess(t('products.success.deleteSuccess'), t('general.success'));
      // تحديث القائمة فقط
      await fetchSpecifications(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting specification:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`${t('products.errors.validationError')}: ${validationErrors}`, t('general.error'));
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('products.errors.deleteError');
        showError(errorMessage, t('general.error'));
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