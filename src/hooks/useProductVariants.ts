import { useState } from 'react';
import axios from 'axios';
import useToast from './useToast';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

const useProductVariants = () => {
  const [variants, setVariants] = useState<any[]>([]);
  const { showSuccess, showError } = useToast();
  const { isRTL } = useLanguage();

  // جلب كل المتغيرات
  const fetchAllVariants = async () => {
    try {
      const res = await axios.get('https://bringus-backend.onrender.com/meta/product-variants');
      setVariants(res.data);
      showSuccess(isRTL ? 'تم جلب جميع متغيرات المنتجات بنجاح' : 'All product variants fetched successfully');
      return res.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب المتغيرات' : 'Error Fetching Variants',
        message: isRTL ? 'فشل في جلب متغيرات المنتجات' : 'Failed to fetch product variants'
      });
      showError(errorMsg.message);
      throw err;
    }
  };

  // جلب متغيرات المنتجات حسب storeId
  const fetchVariantsByStore = async (storeId: string) => {
    try {
      const res = await axios.get('https://bringus-backend.onrender.com/meta/product-variants/by-store', { params: { storeId } });
      setVariants(res.data);
      showSuccess(isRTL ? 'تم جلب متغيرات المنتجات الخاصة بالمتجر بنجاح' : 'Store product variants fetched successfully');
      return res.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب متغيرات المتجر' : 'Error Fetching Store Variants',
        message: isRTL ? 'فشل في جلب متغيرات المنتجات للمتجر' : 'Failed to fetch store product variants'
      });
      showError(errorMsg.message);
      throw err;
    }
  };

  // إضافة متغير منتج
  const addVariant = async (data: any) => {
    try {
      const res = await axios.post('https://bringus-backend.onrender.com/meta/product-variants', data);
      showSuccess(isRTL ? 'تم إضافة متغير المنتج بنجاح' : 'Product variant added successfully');
      return res.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إضافة المتغير' : 'Error Adding Variant',
        message: isRTL ? 'فشل في إضافة متغير المنتج' : 'Failed to add product variant'
      });
      showError(errorMsg.message);
      throw err;
    }
  };

  // تعديل متغير منتج
  const updateVariant = async (id: string, data: any) => {
    try {
      const res = await axios.put(`https://bringus-backend.onrender.com/meta/product-variants/${id}`, data);
      showSuccess(isRTL ? 'تم تعديل متغير المنتج بنجاح' : 'Product variant updated successfully');
      return res.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تعديل المتغير' : 'Error Updating Variant',
        message: isRTL ? 'فشل في تعديل متغير المنتج' : 'Failed to update product variant'
      });
      showError(errorMsg.message);
      throw err;
    }
  };

  // حذف متغير منتج
  const deleteVariant = async (id: string) => {
    try {
      await axios.delete(`https://bringus-backend.onrender.com/meta/product-variants/${id}`);
      showSuccess(isRTL ? 'تم حذف متغير المنتج بنجاح' : 'Product variant deleted successfully');
      return true;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف المتغير' : 'Error Deleting Variant',
        message: isRTL ? 'فشل في حذف متغير المنتج' : 'Failed to delete product variant'
      });
      showError(errorMsg.message);
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