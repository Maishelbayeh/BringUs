import { useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';

const useUnits = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const { t } = useTranslation();

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
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('units.errors.fetchError');
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, units.length, showError, t]);

  // إضافة أو تعديل وحدة
  const saveUnit = async (form: any, editId?: string | number | null, _isRTL: boolean = false) => {
    const storeId = getStoreId();
    if (!storeId) {
      showError(t('units.errors.missingStoreId'));
      return;
    }
    
    const payload: any = {
      nameAr: form.nameAr?.trim() || '',
      nameEn: form.nameEn?.trim() || '',
      descriptionAr: form.descriptionAr?.trim() || '',
      descriptionEn: form.descriptionEn?.trim() || '',
      symbol: form.symbol?.trim() || '',
      isActive: form.isActive !== undefined ? form.isActive : true,
     store:storeId
    };

    try {
      if (editId) {
        // For PUT, backend might expect storeId in payload or might get it from URL/auth
        const updatePayload = { ...payload, storeId };
        await axios.put(`${BASE_URL}meta/units/${editId}`, updatePayload);
        showSuccess(t('units.success.updateSuccess'), t('general.success'));
      } else {
        // For POST, send storeId in the URL
        await axios.post(`${BASE_URL}meta/units`, payload);
        showSuccess(t('units.success.createSuccess'), t('general.success'));
      }
      await fetchUnits(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving unit:', err);
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`${t('units.errors.validationError')}: ${validationErrors}`, t('general.error'));
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('units.errors.updateError');
        showError(errorMessage, t('units.errors.saveError'));
      }
      
      throw err;
    }
  };

  // حذف وحدة
  const deleteUnit = async (unitId: string | number) => {
    try {
      await axios.delete(`${BASE_URL}meta/units/${unitId}`);
      //CONSOLE.log('Unit deleted successfully:', response.data);
      showSuccess(t('units.success.deleteSuccess'), t('general.success'));
      await fetchUnits(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting unit:', err);
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`${t('units.errors.validationError')}: ${validationErrors}`, t('general.error'));
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || t('units.errors.deleteError');
        showError(errorMessage, t('general.error'));
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