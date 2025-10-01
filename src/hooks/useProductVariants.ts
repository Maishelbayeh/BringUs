import { useState } from 'react';
import axios from 'axios';
import useToast from './useToast';

const useProductVariants = () => {
  const [variants, setVariants] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();

  // جلب كل المتغيرات
  const fetchAllVariants = async () => {
    try {
      const res = await axios.get('https://bringus-backend.onrender.com/api/meta/product-variants');
      setVariants(res.data);
      showSuccess('تم جلب جميع متغيرات المنتجات بنجاح');
      return res.data;
    } catch (err: any) {
      showError('فشل في جلب متغيرات المنتجات');
      throw err;
    }
  };

  // جلب متغيرات المنتجات حسب storeId
  const fetchVariantsByStore = async (storeId: string) => {
    try {
      const res = await axios.get('https://bringus-backend.onrender.com/api/meta/product-variants/by-store', { params: { storeId } });
      setVariants(res.data);
      showSuccess('تم جلب متغيرات المنتجات الخاصة بالمتجر بنجاح');
      return res.data;
    } catch (err: any) {
      showError('فشل في جلب متغيرات المنتجات للمتجر');
      throw err;
    }
  };

  // إضافة متغير منتج
  const addVariant = async (data: any) => {
    try {
      const res = await axios.post('https://bringus-backend.onrender.com/api/meta/product-variants', data);
      showSuccess('تم إضافة متغير المنتج بنجاح');
      return res.data;
    } catch (err: any) {
      showError('فشل في إضافة متغير المنتج');
      throw err;
    }
  };

  // تعديل متغير منتج
  const updateVariant = async (id: string, data: any) => {
    try {
      const res = await axios.put(`https://bringus-backend.onrender.com/api/meta/product-variants/${id}`, data);
      showSuccess('تم تعديل متغير المنتج بنجاح');
      return res.data;
    } catch (err: any) {
      showError('فشل في تعديل متغير المنتج');
      throw err;
    }
  };

  // حذف متغير منتج
  const deleteVariant = async (id: string) => {
    try {
      await axios.delete(`https://bringus-backend.onrender.com/api/meta/product-variants/${id}`);
      showSuccess('تم حذف متغير المنتج بنجاح');
      return true;
    } catch (err: any) {
      showError('فشل في حذف متغير المنتج');
      throw err;
    }
  };

  return {
    variants,
    setVariants,
    fetchAllVariants,
    fetchVariantsByStore,
    addVariant,
    updateVariant,
    deleteVariant,
  };
};

export default useProductVariants; 