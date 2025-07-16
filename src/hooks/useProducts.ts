import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

const STORE_ID = '687505893fbf3098648bfe16'; // ثابت للاختبار، يمكن تعديله لاحقاً

const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // للتحقق من تحميل البيانات
  const [lastFetchTime, setLastFetchTime] = useState<number>(0); // لتتبع آخر وقت تم فيه جلب البيانات
  const [hasError, setHasError] = useState(false); // لتتبع وجود خطأ
  const { showSuccess, showError } = useToastContext();

  // جلب جميع المنتجات
  const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
    // إذا كان هناك خطأ سابق ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasError && !forceRefresh) {
      console.log('Previous error occurred, skipping API call. Use forceRefresh to retry.');
      return products;
    }

    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && Array.isArray(products) && products.length > 0) {
      console.log('Products data already loaded, skipping API call');
      return products;
    }

    // منع الاستدعاءات المتكررة أثناء التحميل
    if (loading) {
      console.log('Already loading products, skipping duplicate call');
      return products;
    }

    // منع الاستدعاءات المتكررة خلال 5 ثوانٍ
    const now = Date.now();
    if (!forceRefresh && hasLoaded && (now - lastFetchTime) < 5000) {
      console.log('Products fetched recently, skipping API call');
      return products;
    }

    try {
      setLoading(true);
      setHasError(false); // إعادة تعيين حالة الخطأ عند بدء محاولة جديدة
      const url = `${BASE_URL}meta/products`;
      const res = await axios.get(url);
      console.log('FETCHED PRODUCTS FROM API:', res.data);
      
      // Log barcodes for debugging
      const productsData = res.data.data || res.data;
      if (Array.isArray(productsData)) {
        productsData.forEach((product: any, index: number) => {
          console.log(`🔍 Product ${index + 1} barcodes:`, product.barcodes);
          console.log(`🔍 Product ${index + 1} barcodes type:`, typeof product.barcodes);
          console.log(`🔍 Product ${index + 1} barcodes is array:`, Array.isArray(product.barcodes));
        });
      }
      
      setProducts(productsData);
      setHasLoaded(true); // تم تحميل البيانات
      setLastFetchTime(now); // تحديث وقت آخر جلب
      setHasError(false); // تأكيد عدم وجود خطأ
      return res.data.data || res.data;
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب المنتجات';
      showError(errorMessage);
      // تعيين حالة الخطأ لمنع الاستدعاءات المتكررة
      setHasError(true);
      setHasLoaded(false);
      // لا نرمي الخطأ مرة أخرى لمنع الاستدعاءات المتكررة
      return products;
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, products, loading, lastFetchTime, hasError, showError]);

  // إضافة أو تعديل منتج
  const saveProduct = async (form: any, editId?: string | number | null, isRTL: boolean = false) => {
    console.log('Saving product with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    console.log('Store ID from form:', form.storeId);
    console.log('Form barcodes:', form.barcodes);
    console.log('Form barcodes type:', typeof form.barcodes);
    console.log('Form barcodes is array:', Array.isArray(form.barcodes));
    
    const payload: any = {
      nameAr: form.nameAr?.trim() || '',
      nameEn: form.nameEn?.trim() || '',
      descriptionAr: form.descriptionAr?.trim() || '',
      descriptionEn: form.descriptionEn?.trim() || '',
      price: parseFloat(form.price) || 0,
      compareAtPrice: parseFloat(form.compareAtPrice) || 0,
      barcodes: (() => {
        console.log('🔍 Processing barcodes from form:', form.barcodes);
        if (Array.isArray(form.barcodes)) {
          console.log('🔍 Barcodes is array:', form.barcodes);
          return form.barcodes;
        } else if (typeof form.barcodes === 'string') {
          try {
            const parsed = JSON.parse(form.barcodes);
            console.log('🔍 Parsed barcodes from string:', parsed);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            console.error('🔍 Error parsing barcodes string:', error);
            return [];
          }
        }
        console.log('🔍 Barcodes is not array or string, returning empty array');
        return [];
      })(),
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
      images: Array.isArray(form.images) ? form.images : [],
      mainImage: form.mainImage || null,
      colors: Array.isArray(form.colors) 
        ? form.colors.map((variant: any) => {
            // إذا كان variant يحتوي على colors property (من CustomColorPicker)
            if (variant && typeof variant === 'object' && Array.isArray(variant.colors)) {
              return variant.colors;
            }
            // إذا كان variant مصفوفة ألوان مباشرة
            else if (Array.isArray(variant)) {
              return variant;
            }
            // إذا كان لون واحد
            else if (typeof variant === 'string') {
              return [variant];
            }
            // إذا كان null أو undefined
            else {
              return [];
            }
          }).filter((colors: string[]) => colors.length > 0) // إزالة المصفوفات الفارغة
        : [],
      productLabels: form.tags || [],
      attributes: form.attributes || [],
      specifications: (() => {
        // معالجة المواصفات المختارة
        if (form.selectedSpecifications) {
          try {
            const parsed = JSON.parse(form.selectedSpecifications);
            if (Array.isArray(parsed)) {
              // استخراج IDs المواصفات فقط (بدون القيم)
              const specificationIds = [...new Set(parsed.map((spec: any) => spec._id.split('_')[0]))];
              console.log('Specification IDs:', specificationIds);
              return specificationIds;
            }
          } catch (error) {
            console.error('Error parsing selectedSpecifications:', error);
          }
        }
        // إذا كانت المواصفات موجودة في form.productSpecifications
        if (form.productSpecifications && Array.isArray(form.productSpecifications)) {
          return form.productSpecifications;
        }
        return [];
      })(),
      specificationValues: (() => {
        // معالجة قيم المواصفات المختارة
        if (form.selectedSpecifications) {
          try {
            const parsed = JSON.parse(form.selectedSpecifications);
            if (Array.isArray(parsed)) {
              // تحويل المواصفات إلى التنسيق المطلوب للـ API
              const formattedSpecs = parsed.map((spec: any) => {
                const specificationId = spec._id.split('_')[0]; // أخذ ID المواصفة الأساسي
                const valueIndex = spec._id.split('_')[1]; // أخذ index القيمة
                
                return {
                  specificationId: specificationId,
                  valueId: spec._id,
                  value: spec.value, // القيمة المختارة (مثل: "أحمر"، "كبير")
                  title: spec.title  // عنوان المواصفة (مثل: "اللون"، "الحجم")
                };
              });
              console.log('Specification values:', formattedSpecs);
              return formattedSpecs;
            }
          } catch (error) {
            console.error('Error parsing selectedSpecifications:', error);
          }
        }
        return [];
      })(),
      storeId: form.storeId || STORE_ID,
    };

    console.log('🔍 Final payload barcodes:', payload.barcodes);
    console.log('🔍 Final payload barcodes type:', typeof payload.barcodes);
    console.log('🔍 Final payload barcodes is array:', Array.isArray(payload.barcodes));

                console.log('Final payload to send:', payload);
      console.log('Barcodes in payload:', payload.barcodes);
      console.log('Barcodes type:', typeof payload.barcodes);
      console.log('Barcodes is array:', Array.isArray(payload.barcodes));
      console.log('Barcodes length:', Array.isArray(payload.barcodes) ? payload.barcodes.length : 'N/A');
          console.log('Specifications in payload:', payload.specifications);
          console.log('Specifications type:', typeof payload.specifications);
          console.log('Specifications is array:', Array.isArray(payload.specifications));
          console.log('Specification values in payload:', payload.specificationValues);
          console.log('Specification values type:', typeof payload.specificationValues);
          console.log('Specification values is array:', Array.isArray(payload.specificationValues));
          console.log('Images in payload:', payload.images);

      console.log('Store field in payload:', payload.store);
    try {
      if (editId) {
        console.log('🔍 Updating product with ID:', editId);
        console.log('🔍 Update URL:', `${BASE_URL}meta/products/${editId}`);
        const response = await axios.put(`${BASE_URL}meta/products/${editId}`, payload);
        console.log('Product updated successfully:', response.data);
        showSuccess('تم تعديل المنتج بنجاح', 'نجح التحديث');
      } else {
        console.log('🔍 Creating new product');
        console.log('🔍 Create URL:', `${BASE_URL}products`);
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
      formData.append('folder', 'products');

      const response = await axios.post(`${BASE_URL}stores/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image uploaded successfully:', response.data);
      return response.data.data.url;
    } catch (err: any) {
      console.error('Error uploading product image:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصورة';
      showError(errorMessage, 'خطأ في رفع الصورة');
      throw err;
    }
  };

  // رفع صور متعددة للمنتج
  const uploadProductImages = async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('storeId', STORE_ID);
      formData.append('folder', 'products');

      const response = await axios.post(`${BASE_URL}stores/upload-multiple-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Images uploaded successfully:', response.data);
      return response.data.data.map((img: any) => img.url);
    } catch (err: any) {
      console.error('Error uploading product images:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصور';
      showError(errorMessage, 'خطأ في رفع الصور');
      throw err;
    }
  };

  // رفع صورة واحدة للمعرض
  const uploadSingleImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', STORE_ID);
      formData.append('folder', 'products');

      const response = await axios.post(`${BASE_URL}stores/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Single image uploaded successfully:', response.data);
      return response.data.data.url;
    } catch (err: any) {
      console.error('Error uploading single image:', err);
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
    
    // التحقق من تكرار الاسم العربي
    const existingProductAr = Array.isArray(products) ? products.find(product => {
      const productId = product._id || product.id;
      // إذا كان هذا هو نفس المنتج الذي نعدله، نتجاهله
      if (currentProductId && productId === currentProductId) {
        return false;
      }
      // التحقق من التكرار بالاسم العربي فقط
      return product.nameAr === form.nameAr.trim();
    }) : null;
    
    // التحقق من تكرار الاسم الإنجليزي
    const existingProductEn = Array.isArray(products) ? products.find(product => {
      const productId = product._id || product.id;
      // إذا كان هذا هو نفس المنتج الذي نعدله، نتجاهله
      if (currentProductId && productId === currentProductId) {
        return false;
      }
      // التحقق من التكرار بالاسم الإنجليزي فقط
      return product.nameEn === form.nameEn.trim();
    }) : null;
    
    // Debug: طباعة معلومات التحقق
    console.log('🔍 Validation Debug:');
    console.log('🔍 Current Product ID:', currentProductId);
    console.log('🔍 Form nameAr:', form.nameAr.trim());
    console.log('🔍 Form nameEn:', form.nameEn.trim());
    console.log('🔍 Total products in array:', products.length);
    console.log('🔍 Products sample:', products.slice(0, 3).map(p => ({ id: p._id || p.id, nameAr: p.nameAr, nameEn: p.nameEn })));
    console.log('🔍 Existing Product Ar:', existingProductAr);
    console.log('🔍 Existing Product En:', existingProductEn);
    
    if (existingProductAr) {
      errors.nameAr = isRTL ? 'الاسم العربي موجود مسبقاً' : 'Arabic name already exists';
      console.log('🔍 Arabic name validation failed');
    }
    
    if (existingProductEn) {
      errors.nameEn = isRTL ? 'الاسم الإنجليزي موجود مسبقاً' : 'English name already exists';
      console.log('🔍 English name validation failed');
    }

    return errors;
  };

  // دالة لإعادة تعيين حالة التحميل
  const resetLoadingState = useCallback(() => {
    setLoading(false);
    setHasLoaded(false);
    setLastFetchTime(0);
    setHasError(false); // إعادة تعيين حالة الخطأ أيضاً
  }, []);

  // دالة لإعادة المحاولة في حالة الخطأ
  const retryFetch = useCallback(async () => {
    setHasError(false);
    return await fetchProducts(true);
  }, [fetchProducts]);

  return {
    products,
    setProducts,
    loading,
    hasError,
    fetchProducts,
    saveProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductImages,
    uploadSingleImage,
    validateProduct,
    resetLoadingState,
    retryFetch,
  };
};

export default useProducts; 