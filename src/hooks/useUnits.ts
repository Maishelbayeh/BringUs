import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';

const useUnits = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { showSuccess, showError } = useToastContext();

  // جلب جميع الوحدات
  const fetchUnits = useCallback(async (forceRefresh: boolean = false) => {
    if (hasLoaded && !forceRefresh && units.length > 0) {
      // //CONSOLE.log('Units data already loaded, skipping API call');
      return units;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}meta/stores/${getStoreId()}/units`;
      const res = await axios.get(url);
      // //CONSOLE.log('FETCHED UNITS FROM API:', res.data);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setUnits(data);
      setHasLoaded(true);
      return data;
    } catch (err: any) {
      //CONSOLE.error('Error fetching units:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب الوحدات';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, units.length, showError]);

  // إضافة أو تعديل وحدة
  const saveUnit = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    const storeId = getStoreId();
    if (!storeId) {
      showError('Store ID is missing. Cannot save unit.');
      return;
    }
    
    const payload: any = {
      nameAr: form.nameAr?.trim() || '',
      nameEn: form.nameEn?.trim() || '',
      symbol: form.symbol?.trim() || '',
      isActive: form.isActive !== undefined ? form.isActive : true,
     store:storeId
    };

    try {
      if (editId) {
        // For PUT, backend might expect storeId in payload or might get it from URL/auth
        const updatePayload = { ...payload, storeId };
        const response = await axios.put(`${BASE_URL}meta/units/${editId}`, updatePayload);
        showSuccess('تم تعديل الوحدة بنجاح', 'نجح التحديث');
      } else {
        // For POST, send storeId in the URL
        const response = await axios.post(`${BASE_URL}meta/units`, payload);
        showSuccess('تم إضافة الوحدة بنجاح', 'نجح الإضافة');
      }
      await fetchUnits(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving unit:', err);
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في البيانات');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حفظ الوحدة';
        showError(errorMessage, 'خطأ في الحفظ');
      }
      
      throw err;
    }
  };

  // حذف وحدة
  const deleteUnit = async (unitId: string | number) => {
    try {
      const response = await axios.delete(`${BASE_URL}meta/units/${unitId}`);
      //CONSOLE.log('Unit deleted successfully:', response.data);
      showSuccess('تم حذف الوحدة بنجاح', 'نجح الحذف');
      await fetchUnits(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting unit:', err);
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في الحذف');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حذف الوحدة';
        showError(errorMessage, 'خطأ في الحذف');
      }
      
      throw err;
    }
  };

  return {
    units,
    setUnits,
    loading,
    fetchUnits,
    saveUnit,
    deleteUnit,
  };
};

export default useUnits; 