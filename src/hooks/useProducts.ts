import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

const STORE_ID = '686a719956a82bfcc93a2e2d'; // ثابت للاختبار، يمكن تعديله لاحقاً

const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const { showSuccess, showError } = useToastContext();

  // جلب جميع المنتجات
  const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && Array.isArray(products) && products.length > 0) {
      console.log('Products data already loaded, skipping API call');
      return products;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}meta/products`;
      const res = await axios.get(url);
      console.log('FETCHED PRODUCTS FROM API:', res.data);
      setProducts(res.data.data || res.data);
      setHasLoaded(true); // تم تحميل البيانات
      return res.data.data || res.data;
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب المنتجات';
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, products, showError]);

  // إضافة أو تعديل منتج
  const saveProduct = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    console.log('Saving product with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    console.log('Store ID from form:', form.storeId);
    
    const payload: any = {
      nameAr: form.nameAr?.trim() || '',
      nameEn: form.nameEn?.trim() || '',
      descriptionAr: form.descriptionAr?.trim() || '',
      descriptionEn: form.descriptionEn?.trim() || '',
      price: parseFloat(form.price) || 0,
      compareAtPrice: parseFloat(form.compareAtPrice) || 0,
      barcode: form.barcode?.trim() || '',
      costPrice: parseFloat(form.costPrice) || 0,
      availableQuantity: parseInt(String(form.availableQuantity)) || 0,
      stock: parseInt(String(form.availableQuantity)) || 0,
      lowStockThreshold: parseInt(String(form.lowStockThreshold)) || 5,
      productOrder: parseInt(String(form.productOrder)) || 0,
      visibility: form.visibility === 'Y' || form.visibility === true,
      isActive: form.isActive !== undefined ? form.isActive : true,
      isFeatured: form.isFeatured || false,
      isOnSale: form.isOnSale || false,
      salePercentage: parseFloat(form.salePercentage) || 0,
      category: form.categoryId || null,
      unit: form.unitId && form.unitId !== '' ? form.unitId : null,
      images: form.images || [],
      mainImage: form.mainImage || null,
      colors: Array.isArray(form.colors) 
        ? form.colors.map((variant: any) => Array.isArray(variant.colors) ? variant.colors : [])
        : [],
      productLabels: form.tags || [],
      attributes: form.attributes || [],
      specifications: form.specifications || [],
      storeId: form.storeId || STORE_ID,
    };

          console.log('Final payload to send:', payload);

      console.log('Store field in payload:', payload.store);
    try {
      if (editId) {
        const response = await axios.put(`${BASE_URL}meta/products/${editId}`, payload);
        console.log('Product updated successfully:', response.data);
        showSuccess('تم تعديل المنتج بنجاح', 'نجح التحديث');
      } else {
        const response = await axios.post(`${BASE_URL}products`, payload);
        console.log('Product created successfully:', response.data);
        showSuccess('تم إضافة المنتج بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchProducts(true);
      return true;
    } catch (err: any) {
      console.error('Error saving product:', err);
      console.error('Request payload:', payload);
      console.error('Response data:', err?.response?.data);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في البيانات');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حفظ المنتج';
        showError(errorMessage, 'خطأ في الحفظ');
      }
      
      throw err;
    }
  };

  // حذف منتج
  const deleteProduct = async (productId: string | number) => {
    try {
      const response = await axios.delete(`${BASE_URL}meta/products/${productId}?storeId=${STORE_ID}`);
      console.log('Product deleted successfully:', response.data);
      showSuccess('تم حذف المنتج بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchProducts(true);
      return true;
    } catch (err: any) {
      console.error('Error deleting product:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
        showError(`خطأ في التحقق: ${validationErrors}`, 'خطأ في الحذف');
      } else {
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حذف المنتج';
        showError(errorMessage, 'خطأ في الحذف');
      }
      
      throw err;
    }
  };

  // رفع صورة المنتج
  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', STORE_ID);

      const response = await axios.post(`${BASE_URL}meta/products/upload-main-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image uploaded successfully:', response.data);
      return response.data.imageUrl || response.data.url;
    } catch (err: any) {
      console.error('Error uploading product image:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصورة';
      showError(errorMessage, 'خطأ في رفع الصورة');
      throw err;
    }
  };

  // دالة التحقق من صحة البيانات
  const validateProduct = (form: any, isRTL: boolean = false, editId?: string | number) => {
    const errors: { [key: string]: string } = {};

    // التحقق من الاسم العربي
    if (!form.nameAr || form.nameAr.trim() === '') {
      errors.nameAr = isRTL ? 'الاسم بالعربية مطلوب' : 'Arabic name is required';
    } else if (form.nameAr.trim().length > 200) {
      errors.nameAr = isRTL ? 'الاسم بالعربية لا يمكن أن يتجاوز 200 حرف' : 'Arabic name cannot exceed 200 characters';
    }

    // التحقق من الاسم الإنجليزي
    if (!form.nameEn || form.nameEn.trim() === '') {
      errors.nameEn = isRTL ? 'الاسم بالانجليزية مطلوب' : 'English name is required';
    } else if (form.nameEn.trim().length > 200) {
      errors.nameEn = isRTL ? 'الاسم بالانجليزية لا يمكن أن يتجاوز 200 حرف' : 'English name cannot exceed 200 characters';
    }

    // التحقق من السعر
    if (!form.price || parseFloat(form.price) <= 0) {
      errors.price = isRTL ? 'السعر مطلوب ويجب أن يكون أكبر من صفر' : 'Price is required and must be greater than zero';
    }

    // التحقق من الكمية المتاحة
    if (form.availableQuantity !== undefined && parseInt(String(form.availableQuantity)) < 0) {
      errors.availableQuantity = isRTL ? 'الكمية المتاحة لا يمكن أن تكون سالبة' : 'Available quantity cannot be negative';
    }

    // التحقق من عدم تكرار الاسم في نفس المستوى
    // نتجاهل المنتج الحالي عند التعديل
    const currentProductId = editId || form.id || form._id;
    const existingProduct = Array.isArray(products) ? products.find(product => {
      const productId = product._id || product.id;
      // إذا كان هذا هو نفس المنتج الذي نعدله، نتجاهله
      if (currentProductId && productId === currentProductId) {
        return false;
      }
      // التحقق من التكرار بالاسمين العربي والإنجليزي
      return product.nameAr === form.nameAr.trim() && product.nameEn === form.nameEn.trim();
    }) : null;
    
    if (existingProduct) {
      const errorMsg = isRTL ? 'هذا المنتج موجود مسبقاً' : 'This product already exists';
      errors.nameAr = errorMsg;
      errors.nameEn = errorMsg;
    }

    return errors;
  };

  return {
    products,
    setProducts,
    loading,
    fetchProducts,
    saveProduct,
    deleteProduct,
    uploadProductImage,
    validateProduct,
  };
};

export default useProducts; 