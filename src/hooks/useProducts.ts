import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

// Import the store utility function
import { getStoreId } from '../utils/storeUtils';

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
      //CONSOLE.log('Previous error occurred, skipping API call. Use forceRefresh to retry.');
      return products;
    }

    // إذا كانت البيانات محملة مسبقاً ولا نحتاج تحديث قسري، لا نضرب الـ API
    if (hasLoaded && !forceRefresh && Array.isArray(products) && products.length > 0) {
      //CONSOLE.log('Products data already loaded, skipping API call');
      return products;
    }

    // منع الاستدعاءات المتكررة أثناء التحميل
    if (loading) {
      //CONSOLE.log('Already loading products, skipping duplicate call');
      return products;
    }

    // منع الاستدعاءات المتكررة خلال 5 ثوانٍ
    const now = Date.now();
    if (!forceRefresh && hasLoaded && (now - lastFetchTime) < 5000) {
      //CONSOLE.log('Products fetched recently, skipping API call');
      return products;
    }


    try {
      setLoading(true);
      setHasError(false); // إعادة تعيين حالة الخطأ عند بدء محاولة جديدة
      const url = `${BASE_URL}products/by-store/${getStoreId()}`;
      const res = await axios.get(url);
      //CONSOLE.log('FETCHED PRODUCTS FROM API:', res.data);
      
      
      // Log barcodes for debugging
      const productsData = res.data.data || res.data;
     
      
      setProducts(productsData);
      setHasLoaded(true); // تم تحميل البيانات
      setLastFetchTime(now); // تحديث وقت آخر جلب
      setHasError(false); // تأكيد عدم وجود خطأ
      return res.data.data || res.data;
    } catch (err: any) {
      //CONSOLE.error('Error fetching products:', err);
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
  const saveProduct = async (form: any, editId?: string | number | null) => {
    //CONSOLE.log('Saving product with form:', form, 'editId:', editId, 'isRTL:', isRTL);
    //CONSOLE.log('Store ID from form:', form.storeId);
    //CONSOLE.log('Form barcodes:', form.barcodes);
    //CONSOLE.log('Form barcodes type:', typeof form.barcodes);
    //CONSOLE.log('Form barcodes is array:', Array.isArray(form.barcodes));
    
    const payload: any = {
      nameAr: form.nameAr?.trim() || '',
      nameEn: form.nameEn?.trim() || '',
      descriptionAr: form.descriptionAr?.trim() || '',
      descriptionEn: form.descriptionEn?.trim() || '',
      price: parseFloat(form.price) || 0,
      compareAtPrice: parseFloat(form.compareAtPrice) || 0,
      barcodes: (() => {
        //CONSOLE.log('🔍 Processing barcodes from form:', form.barcodes);
        if (Array.isArray(form.barcodes)) {
          //CONSOLE.log('🔍 Barcodes is array:', form.barcodes);
          return form.barcodes;
        } else if (typeof form.barcodes === 'string') {
          try {
            const parsed = JSON.parse(form.barcodes);
            //CONSOLE.log('🔍 Parsed barcodes from string:', parsed);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            //CONSOLE.error('🔍 Error parsing barcodes string:', error);
            return [];
          }
        }
        //CONSOLE.log('🔍 Barcodes is not array or string, returning empty array');
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
      categories: (() => {
        // Use categoryIds if available, otherwise use categoryId as single item array
        if (form.categoryIds && Array.isArray(form.categoryIds) && form.categoryIds.length > 0) {
          return form.categoryIds;
        } else if (form.categoryId) {
          return [form.categoryId];
        } else {
          return [];
        }
      })(),
      unit: form.unitId || null, // <-- use unitId from form
      images: Array.isArray(form.images) ? form.images : [],
      mainImage: form.mainImage || null,
      colors: (() => {
        if (Array.isArray(form.colors)) {
          const processedColors = form.colors.map((variant: any) => {
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
          }).filter((colors: string[]) => colors.length > 0); // إزالة المصفوفات الفارغة
          
          return processedColors;
        } else {
          return [];
        }
      })(),
      productLabels: (() => {
        // Use tags if available, otherwise use productLabels
        const labels = form.productLabels || [];
        return labels;
      })(),
      attributes: form.attributes || [],
      specifications: (() => {
        // أولاً: محاولة استخدام specifications الموجودة في form
        if (form.specifications && Array.isArray(form.specifications)) {
          return form.specifications;
        }
        
        // ثانياً: معالجة المواصفات المختارة من selectedSpecifications
        if (form.selectedSpecifications) {
          try {
            const parsed = JSON.parse(form.selectedSpecifications);
            if (Array.isArray(parsed)) {
              // استخراج IDs المواصفات فقط (بدون القيم)
              const specificationIds = [...new Set(parsed.map((spec: any) => spec._id.split('_')[0]))];
              return specificationIds;
            }
          } catch (error) {
            console.error('🔍 saveProduct - Error parsing selectedSpecifications:', error);
          }
        }
        
        // ثالثاً: إذا كانت المواصفات موجودة في form.productSpecifications
        if (form.productSpecifications && Array.isArray(form.productSpecifications)) {
          return form.productSpecifications;
        }
        
        return [];
      })(),
      specificationValues: (() => {
        // أولاً: محاولة استخدام specificationValues الموجودة في form
        if (form.specificationValues && Array.isArray(form.specificationValues)) {
          // Ensure each specification value has the required title field
          return form.specificationValues.map((spec: any) => {
            if (!spec.title && spec.specificationId) {
              // If title is missing, we need to fetch it or provide a default
              // For now, we'll use the specificationId as title if missing
              return {
                ...spec,
                title: spec.title || `Specification ${spec.specificationId}`
              };
            }
            return spec;
          });
        }
        
        // ثانياً: معالجة قيم المواصفات المختارة من selectedSpecifications
        if (form.selectedSpecifications) {
          try {
            const parsed = JSON.parse(form.selectedSpecifications);
            if (Array.isArray(parsed)) {
              // تحويل المواصفات إلى التنسيق المطلوب للـ API
              const formattedSpecs = parsed.map((spec: any) => {
                const specificationId = spec._id.split('_')[0]; // أخذ ID المواصفة الأساسي
                
                // Ensure we have a proper title - use the spec title if available, otherwise use a fallback
                let title = spec.title;
                if (!title && spec.specificationTitle) {
                  title = spec.specificationTitle;
                }
                if (!title && spec.titleAr) {
                  title = spec.titleAr;
                }
                if (!title && spec.titleEn) {
                  title = spec.titleEn;
                }
                if (!title) {
                  title = `Specification ${specificationId}`;
                }
                
                return {
                  specificationId: specificationId,
                  valueId: spec._id,
                  value: spec.value, // القيمة المختارة (مثل: "أحمر"، "كبير")
                  title: title  // عنوان المواصفة (مثل: "اللون"، "الحجم")
                };
              });
              return formattedSpecs;
            }
          } catch (error) {
            console.error('🔍 saveProduct - Error parsing selectedSpecifications for values:', error);
          }
        }
        
        return [];
      })(),
      videoUrl: form.videoUrl || '',
      storeId: form.storeId || getStoreId(),
    };

    // Debug logging for videoUrl
    console.log('🔍 useProducts - saveProduct - form.videoUrl:', form.videoUrl);
    console.log('🔍 useProducts - saveProduct - payload.videoUrl:', payload.videoUrl);

    // Remove unit if invalid
    if (
      payload.unit === null ||
      payload.unit === undefined ||
      payload.unit === '' ||
      payload.unit === 'null'
    ) {
      delete payload.unit;
    }

    //CONSOLE.log('🔍 Final payload barcodes:', payload.barcodes);
    //CONSOLE.log('🔍 Final payload barcodes type:', typeof payload.barcodes);
    //CONSOLE.log('🔍 Final payload barcodes is array:', Array.isArray(payload.barcodes));

     
      //CONSOLE.log('Barcodes in payload:', payload.barcodes);
      //CONSOLE.log('Barcodes type:', typeof payload.barcodes);
      //CONSOLE.log('Barcodes is array:', Array.isArray(payload.barcodes));
      //CONSOLE.log('Barcodes length:', Array.isArray(payload.barcodes) ? payload.barcodes.length : 'N/A');
          //CONSOLE.log('Specifications in payload:', payload.specifications);
          //CONSOLE.log('Specifications type:', typeof payload.specifications);
          //CONSOLE.log('Specifications is array:', Array.isArray(payload.specifications));
          //CONSOLE.log('Specification values in payload:', payload.specificationValues);
      //CONSOLE.log('Specification values type:', typeof payload.specificationValues);
      //CONSOLE.log('Specification values is array:', Array.isArray(payload.specificationValues));
      //CONSOLE.log('Images in payload:', payload.images);
      //CONSOLE.log('Main image in payload:', payload.mainImage);
      //CONSOLE.log('Main image type:', typeof payload.mainImage);
      //CONSOLE.log('Main image === null:', payload.mainImage === null);

      //CONSOLE.log('Store field in payload:', payload.store);
    try {
      if (editId) {
      
      } else {
        
        showSuccess('تم إضافة المنتج بنجاح', 'نجح الإضافة');
      }
      // تحديث القائمة فقط
      await fetchProducts(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error saving product:', err);
      //CONSOLE.error('Request payload:', payload);
      //CONSOLE.error('Response data:', err?.response?.data);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.msg) showError(error.msg, 'خطأ في البيانات');
            else if (typeof error === 'string') showError(error, 'خطأ في البيانات');
          });
        } else if (typeof errors === 'object') {
          Object.values(errors).forEach((msg: any) => {
            if (msg) showError(msg, 'خطأ في البيانات');
          });
        } else if (typeof errors === 'string') {
          showError(errors, 'خطأ في البيانات');
        }
      } else if (err?.response?.data?.error) {
        showError(err.response.data.error, 'خطأ في البيانات');
      } else if (err?.response?.data?.message) {
        showError(err.response.data.message, 'خطأ في البيانات');
      } else {
        showError('حدث خطأ غير متوقع', 'خطأ');
      }
      
      throw err;
    }
  };

  // حذف منتج
  const deleteProduct = async (productId: string | number) => {
    try {
      await axios.delete(`${BASE_URL}meta/products/${productId}?storeId=${getStoreId()}`);
      //CONSOLE.log('Product deleted successfully:');
      showSuccess('تم حذف المنتج بنجاح', 'نجح الحذف');
      // تحديث القائمة فقط
      await fetchProducts(true);
      return true;
    } catch (err: any) {
      //CONSOLE.error('Error deleting product:', err);
      
      // معالجة أخطاء التحقق من الـAPI
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errors.forEach((error: any) => {
            if (error.msg) showError(error.msg, 'خطأ في الحذف');
            else if (typeof error === 'string') showError(error, 'خطأ في الحذف');
          });
        } else if (typeof errors === 'object') {
          Object.values(errors).forEach((msg: any) => {
            if (msg) showError(msg, 'خطأ في الحذف');
          });
        } else if (typeof errors === 'string') {
          showError(errors, 'خطأ في الحذف');
        }
      } else if (err?.response?.data?.error) {
        showError(err.response.data.error, 'خطأ في الحذف');
      } else if (err?.response?.data?.message) {
        showError(err.response.data.message, 'خطأ في الحذف');
      } else {
        showError('حدث خطأ غير متوقع', 'خطأ');
      }
      
      throw err;
    }
  };

  // رفع صورة المنتج
  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', getStoreId());

      const response = await axios.post(`${BASE_URL}products/upload-single-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //CONSOLE.log('Image uploaded successfully:', response.data);
      // API يعيد imageUrl مباشرة، وليس في data.url
      return response.data.imageUrl || response.data.data?.url;
    } catch (err: any) {
      //CONSOLE.error('Error uploading product image:', err);
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
      formData.append('storeId', getStoreId());

      const response = await axios.post(`${BASE_URL}products/upload-gallery-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //CONSOLE.log('Images uploaded successfully:', response.data);
      // API يعيد images array مباشرة، وليس في data
      const images = response.data.images || response.data.data?.images || [];
      return images.map((img: any) => img.imageUrl || img.url);
    } catch (err: any) {
      //CONSOLE.error('Error uploading product images:', err);
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
      formData.append('storeId', getStoreId());

      const response = await axios.post(`${BASE_URL}products/upload-single-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //CONSOLE.log('Single image uploaded successfully:', response.data);
      // API يعيد imageUrl مباشرة، وليس في data.url
      return response.data.imageUrl || response.data.data?.url;
    } catch (err: any) {
      //CONSOLE.error('Error uploading single image:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصورة';
      showError(errorMessage, 'خطأ في رفع الصورة');
      throw err;
    }
  };

  // رفع الصورة الأساسية
  const uploadMainImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('storeId', getStoreId());

      const response = await axios.post(`${BASE_URL}products/upload-main-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // API يعيد imageUrl مباشرة، وليس في data.url
      const imageUrl = response.data.imageUrl || response.data.data?.url;
      
      return imageUrl;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في رفع الصورة الأساسية';
      showError(errorMessage, 'خطأ في رفع الصورة الأساسية');
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
    //CONSOLE.log('🔍 Validation Debug:');
    //CONSOLE.log('🔍 Current Product ID:', currentProductId);
    //CONSOLE.log('🔍 Form nameAr:', form.nameAr.trim());
    //CONSOLE.log('🔍 Form nameEn:', form.nameEn.trim());
    //CONSOLE.log('🔍 Total products in array:', products.length);
    //CONSOLE.log('🔍 Products sample:', products.slice(0, 3).map(p => ({ id: p._id || p.id, nameAr: p.nameAr, nameEn: p.nameEn })));
    //CONSOLE.log('🔍 Existing Product Ar:', existingProductAr);
    //CONSOLE.log('🔍 Existing Product En:', existingProductEn);
    
    if (existingProductAr) {
      errors.nameAr = isRTL ? 'الاسم العربي موجود مسبقاً' : 'Arabic name already exists';
      //CONSOLE.log('🔍 Arabic name validation failed');
    }
    
    if (existingProductEn) {
      errors.nameEn = isRTL ? 'الاسم الإنجليزي موجود مسبقاً' : 'English name already exists';
      //CONSOLE.log('🔍 English name validation failed');
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

  // Add new variant to existing product
  const addVariant = async (productId: string, variantData: any): Promise<any> => {
    try {
      
      // حذف specifications إذا كانت مصفوفة فارغة
      if (Array.isArray(variantData.specifications) && variantData.specifications.length === 0) {
        delete variantData.specifications;
      }

      // Ensure colors is an array of arrays of strings (no empty arrays or ["[]"])
      if (Array.isArray(variantData.colors)) {
        // If colors is array of objects with 'colors' property, convert to array of arrays of strings
        if (variantData.colors[0] && typeof variantData.colors[0] === 'object' && Array.isArray(variantData.colors[0].colors)) {
          variantData.colors = variantData.colors
            .map((c: any) => Array.isArray(c.colors)
              ? c.colors.filter((color: any) => typeof color === 'string' && color.trim() !== '' && color.trim() !== '[]')
              : []
            )
            .filter((arr: string[]) => arr.length > 0);
        } else {
          variantData.colors = variantData.colors
            .map((colorArr: any) =>
              Array.isArray(colorArr)
                ? colorArr.filter((color: any) => typeof color === 'string' && color.trim() !== '' && color.trim() !== '[]')
                : (typeof colorArr === 'string' && colorArr.trim() !== '' && colorArr.trim() !== '[]')
                  ? [colorArr]
                  : []
            )
            .filter((arr: string[]) => Array.isArray(arr) && arr.length > 0);
        }
      }

      // Clean up reference fields before sending
      const cleanReference = (val: any) => {
        if (!val) return val;
        if (typeof val === 'object' && (val._id || val.id)) return val._id || val.id;
        return val;
      };
      
      // Handle categories - use categoryIds if available, otherwise use categoryId
      if (variantData.categoryIds && Array.isArray(variantData.categoryIds) && variantData.categoryIds.length > 0) {
        variantData.categories = variantData.categoryIds.map(cleanReference);
        delete variantData.category;
        delete variantData.categoryId;
        delete variantData.categoryIds;
      } else if (variantData.categoryId) {
        variantData.categories = [cleanReference(variantData.categoryId)];
        delete variantData.category;
        delete variantData.categoryId;
      } else if (variantData.category) {
        variantData.categories = [cleanReference(variantData.category)];
        delete variantData.category;
      } else {
        variantData.categories = [];
      }
      
      // variantData.unit = cleanReference(variantData.unit);
      variantData.store = cleanReference(variantData.store);
      // --- FIX: Ensure productLabels is always an array of IDs ---
      if (typeof variantData.productLabels === 'string') {
        variantData.productLabels = variantData.productLabels.split(',').map((id: string) => id.trim());
      }
      if (Array.isArray(variantData.productLabels)) {
        variantData.productLabels = variantData.productLabels.map(cleanReference);
      }
      // Remove variants field if present (should not be sent for variants)
      if ('variants' in variantData) {
        delete variantData.variants;
      }



      const formData = new FormData();
      
      // Add all variant data to formData
      Object.keys(variantData).forEach(key => {
        if (key === 'images' && Array.isArray(variantData[key])) {
          variantData[key].forEach((file: File) => {
            formData.append('images', file);
          });
        } else if (key === 'mainImage' && variantData[key] instanceof File) {
          formData.append('mainImage', variantData[key]);
        } else if (key === 'barcodes' && Array.isArray(variantData[key])) {
          formData.append('barcodes', JSON.stringify(variantData[key]));
        } else if (key === 'categories' && Array.isArray(variantData[key])) {
          // Send each category ID separately to avoid double JSON stringification
          variantData[key].forEach((categoryId: any) => {
            formData.append('categories', categoryId);
          });
        } else if (key === 'specifications' && Array.isArray(variantData[key])) {
          if (variantData[key].length > 0) {
            formData.append('specifications', JSON.stringify(variantData[key]));
          }
        } else if (key === 'specificationValues' && Array.isArray(variantData[key])) {
          // Handle specification values array - ensure title field is present
          const processedSpecValues = variantData[key].map((spec: any) => {
            if (!spec.title && spec.specificationId) {
              // Ensure we have a proper title - use the spec title if available, otherwise use a fallback
              let title = spec.title;
              if (!title && spec.specificationTitle) {
                title = spec.specificationTitle;
              }
              if (!title && spec.titleAr) {
                title = spec.titleAr;
              }
              if (!title && spec.titleEn) {
                title = spec.titleEn;
              }
              if (!title) {
                title = `Specification ${spec.specificationId}`;
              }
              
              return {
                ...spec,
                title: title
              };
            }
            return spec;
          });
          formData.append('specificationValues', JSON.stringify(processedSpecValues));
        } else if (key === 'productLabels' && Array.isArray(variantData[key])) {
          variantData[key].forEach((label: any) => {
            formData.append('productLabels', typeof label === 'object' ? label._id || label.id : label);
          });
        } else if (key === 'visibility') {
          formData.append('visibility', variantData[key] === 'Y' || variantData[key] === true ? 'true' : 'false');
        } else if (key === 'attributes' && Array.isArray(variantData[key]) && variantData[key].length > 0) {
          formData.append('attributes', JSON.stringify(variantData[key]));
        } else if (key === 'attributes') {
          // لا ترسل attributes إذا لم تكن مصفوفة غير فارغة
          // skip
        } else if (key === 'colors' && Array.isArray(variantData[key])) {
          // Check if colors is already a JSON string to avoid double stringification
          const colorsValue = variantData[key];
          if (colorsValue.length > 0 && typeof colorsValue[0] === 'string' && colorsValue[0].startsWith('[')) {
            // Already a JSON string, don't stringify again
            formData.append('colors', colorsValue[0]);
          } else {
            // Normal array, stringify it
            formData.append('colors', JSON.stringify(variantData[key]));
          }
        } else if (key === 'allColors' && Array.isArray(variantData[key])) {
          // Handle allColors array - send each color separately
          variantData[key].forEach((color: any) => {
            formData.append('allColors', color);
          });
        } else if (key === 'storeId') {
          // Only set ONCE, as a string, and do NOT append 'store'
          formData.set('storeId', variantData[key] || getStoreId());
        } else if (key === 'store') {
          // Do NOT append 'store' at all
          // skip
        } else if (
          typeof variantData[key] === 'object' &&
          variantData[key] !== null &&
          !Array.isArray(variantData[key])
        ) {
          // stringify any object (like seo, dimensions, etc.)
          formData.append(key, JSON.stringify(variantData[key]));
        } else {
          formData.append(key, variantData[key]);
        }
      });
      
      // Get store ID from localStorage
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        throw new Error('Store ID not found');
      }
      // The following line is causing storeId to be sent as an array. DELETE IT:
      // formData.append('storeId', STORE_ID);
      
      const response = await fetch(`${BASE_URL}products/${productId}/add-variant`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Show all validation errors
        if (errorData?.errors) {
          const errors = errorData.errors;
          if (Array.isArray(errors)) {
            errors.forEach((error: any) => {
              if (error.msg) showError(error.msg, 'خطأ في البيانات');
              else if (typeof error === 'string') showError(error, 'خطأ في البيانات');
            });
          } else if (typeof errors === 'object') {
            Object.values(errors).forEach((msg: any) => {
              if (msg) showError(msg, 'خطأ في البيانات');
            });
          } else if (typeof errors === 'string') {
            showError(errors, 'خطأ في البيانات');
          }
        } else if (errorData?.error) {
          showError(errorData.error, 'خطأ في البيانات');
        } else if (errorData?.message) {
          showError(errorData.message, 'خطأ في البيانات');
        } else {
          showError('حدث خطأ غير متوقع', 'خطأ');
        }
        throw new Error(errorData.message || 'Failed to add variant');
      }
      
      const data = await response.json();
      
      // Show success toast
      showSuccess('تم إضافة المتغير بنجاح', 'نجح الإضافة');
      
      // Refresh products list
      await fetchProducts(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Delete variant
  const deleteVariant = async (productId: string, variantId: string): Promise<any> => {
    try {
      
      // Get store ID from localStorage
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        throw new Error('Store ID not found');
      }
      
      const response = await fetch(`${BASE_URL}products/${productId}/variants/${variantId}?storeId=${storeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Show all validation errors
        if (errorData?.errors) {
          const errors = errorData.errors;
          if (Array.isArray(errors)) {
            errors.forEach((error: any) => {
              if (error.msg) showError(error.msg, 'خطأ في الحذف');
              else if (typeof error === 'string') showError(error, 'خطأ في الحذف');
            });
          } else if (typeof errors === 'object') {
            Object.values(errors).forEach((msg: any) => {
              if (msg) showError(msg, 'خطأ في الحذف');
            });
          } else if (typeof errors === 'string') {
            showError(errors, 'خطأ في الحذف');
          }
        } else if (errorData?.error) {
          showError(errorData.error, 'خطأ في الحذف');
        } else if (errorData?.message) {
          showError(errorData.message, 'خطأ في الحذف');
        } else {
          showError('حدث خطأ غير متوقع', 'خطأ');
        }
        throw new Error(errorData.message || 'Failed to delete variant');
      }
      
      const data = await response.json();
      
      // Show success toast
      showSuccess('تم حذف المتغير بنجاح', 'نجح الحذف');
      
      // Refresh products list
      await fetchProducts(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Update variant
  const updateVariant = async (productId: string, variantId: string, variantData: any): Promise<any> => {
    try {
      
      // حذف specifications إذا كانت مصفوفة فارغة
      if (Array.isArray(variantData.specifications) && variantData.specifications.length === 0) {
        delete variantData.specifications;
      }

      // Ensure colors is an array of arrays of strings (no empty arrays or ["[]"])
      if (Array.isArray(variantData.colors)) {
        // If colors is array of objects with 'colors' property, convert to array of arrays of strings
        if (variantData.colors[0] && typeof variantData.colors[0] === 'object' && Array.isArray(variantData.colors[0].colors)) {
          variantData.colors = variantData.colors
            .map((c: any) => Array.isArray(c.colors)
              ? c.colors.filter((color: any) => typeof color === 'string' && color.trim() !== '' && color.trim() !== '[]')
              : []
            )
            .filter((arr: string[]) => arr.length > 0);
        } else {
          variantData.colors = variantData.colors
            .map((colorArr: any) =>
              Array.isArray(colorArr)
                ? colorArr.filter((color: any) => typeof color === 'string' && color.trim() !== '' && color.trim() !== '[]')
                : (typeof colorArr === 'string' && colorArr.trim() !== '' && colorArr.trim() !== '[]')
                  ? [colorArr]
                  : []
            )
            .filter((arr: string[]) => Array.isArray(arr) && arr.length > 0);
        }
      }

      // Clean up reference fields before sending
      const cleanReference = (val: any) => {
        if (!val) return val;
        if (typeof val === 'object' && (val._id || val.id)) return val._id || val.id;
        return val;
      };
      
      // Handle categories - use categoryIds if available, otherwise use categoryId
      if (variantData.categoryIds && Array.isArray(variantData.categoryIds) && variantData.categoryIds.length > 0) {
        variantData.categories = variantData.categoryIds.map(cleanReference);
        delete variantData.category;
        delete variantData.categoryId;
        delete variantData.categoryIds;
      } else if (variantData.categoryId) {
        variantData.categories = [cleanReference(variantData.categoryId)];
        delete variantData.category;
        delete variantData.categoryId;
      } else if (variantData.category) {
        variantData.categories = [cleanReference(variantData.category)];
        delete variantData.category;
      } else {
        variantData.categories = [];
      }
      
      variantData.unit = cleanReference(variantData.unit);
      variantData.store = cleanReference(variantData.store);
      // --- FIX: Ensure productLabels is always an array of IDs ---
      if (typeof variantData.productLabels === 'string') {
        variantData.productLabels = variantData.productLabels.split(',').map((id: string) => id.trim());
      }
      if (Array.isArray(variantData.productLabels)) {
        variantData.productLabels = variantData.productLabels.map(cleanReference);
      }
      // Remove variants field if present (should not be sent for variants)
      if ('variants' in variantData) {
        delete variantData.variants;
      }



      const formData = new FormData();
      
      // Add all variant data to formData
      Object.keys(variantData).forEach(key => {
        if (key === 'images' && Array.isArray(variantData[key])) {
          // Handle multiple images
          variantData[key].forEach((file: File) => {
            formData.append('images', file);
          });
        } else if (key === 'mainImage' && variantData[key] instanceof File) {
          // Handle main image
          formData.append('mainImage', variantData[key]);
        } else if (key === 'barcodes' && Array.isArray(variantData[key])) {
          // Handle barcodes array
          formData.append('barcodes', JSON.stringify(variantData[key]));
        } else if (key === 'categories' && Array.isArray(variantData[key])) {
          // Send each category ID separately to avoid double JSON stringification
          variantData[key].forEach((categoryId: any) => {
            formData.append('categories', categoryId);
          });
        } else if (key === 'specifications' && Array.isArray(variantData[key])) {
          // فقط إذا فيها عناصر أرسلها كسلسلة IDs
          if (variantData[key].length > 0) {
            formData.append('specifications', JSON.stringify(variantData[key]));
          }
        } else if (key === 'specificationValues' && Array.isArray(variantData[key])) {
          // Handle specification values array - ensure title field is present
          const processedSpecValues = variantData[key].map((spec: any) => {
            if (!spec.title && spec.specificationId) {
              // Ensure we have a proper title - use the spec title if available, otherwise use a fallback
              let title = spec.title;
              if (!title && spec.specificationTitle) {
                title = spec.specificationTitle;
              }
              if (!title && spec.titleAr) {
                title = spec.titleAr;
              }
              if (!title && spec.titleEn) {
                title = spec.titleEn;
              }
              if (!title) {
                title = `Specification ${spec.specificationId}`;
              }
              
              return {
                ...spec,
                title: title
              };
            }
            return spec;
          });
          formData.append('specificationValues', JSON.stringify(processedSpecValues));
        } else if (key === 'selectedSpecifications') {
          // Handle selectedSpecifications
          if (Array.isArray(variantData[key])) {
            formData.append('selectedSpecifications', JSON.stringify(variantData[key]));
          } else if (typeof variantData[key] === 'string') {
            formData.append('selectedSpecifications', variantData[key]);
          }
        } else if (key === 'productLabels' && Array.isArray(variantData[key])) {
          // Handle productLabels array - send each label separately like in addVariant
          variantData[key].forEach((label: any) => {
            formData.append('productLabels', typeof label === 'object' ? label._id || label.id : label);
          });
        } else if (key === 'colors' && Array.isArray(variantData[key])) {
          // Check if colors is already a JSON string to avoid double stringification
          const colorsValue = variantData[key];
          if (colorsValue.length > 0 && typeof colorsValue[0] === 'string' && colorsValue[0].startsWith('[')) {
            // Already a JSON string, don't stringify again
            formData.append('colors', colorsValue[0]);
          } else {
            // Normal array, stringify it
            formData.append('colors', JSON.stringify(variantData[key]));
          }
        } else if (key === 'allColors' && Array.isArray(variantData[key])) {
          // Handle allColors array - send each color separately
          variantData[key].forEach((color: any) => {
            formData.append('allColors', color);
          });
        } else if (
          typeof variantData[key] === 'object' &&
          variantData[key] !== null &&
          !Array.isArray(variantData[key])
        ) {
          // stringify any object (like seo, dimensions, etc.)
          formData.append(key, JSON.stringify(variantData[key]));
        } else {
          // Handle other fields
          formData.append(key, variantData[key]);
        }
      });
      
      // Get store ID from localStorage
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        throw new Error('Store ID not found');
      }
      formData.append('storeId', storeId);


      
      const response = await fetch(`${BASE_URL}products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Show all validation errors
        if (errorData?.errors) {
          const errors = errorData.errors;
          if (Array.isArray(errors)) {
            errors.forEach((error: any) => {
              if (error.msg) showError(error.msg, 'خطأ في البيانات');
              else if (typeof error === 'string') showError(error, 'خطأ في البيانات');
            });
          } else if (typeof errors === 'object') {
            Object.values(errors).forEach((msg: any) => {
              if (msg) showError(msg, 'خطأ في البيانات');
            });
          } else if (typeof errors === 'string') {
            showError(errors, 'خطأ في البيانات');
          }
        } else if (errorData?.error) {
          showError(errorData.error, 'خطأ في البيانات');
        } else if (errorData?.message) {
          showError(errorData.message, 'خطأ في البيانات');
        } else {
          showError('حدث خطأ غير متوقع', 'خطأ');
        }
        throw new Error(errorData.message || 'Failed to update variant');
      }
      
      const data = await response.json();
      
      // Show success toast
      showSuccess('تم تحديث المتغير بنجاح', 'نجح التحديث');
      
      // Refresh products list
      await fetchProducts(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Fetch variants for a product
  const fetchProductVariants = async (productId: string, storeId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${BASE_URL}products/${productId}/variants`, {
        params: { storeId },
      });
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في جلب متغيرات المنتج';
      showError(errorMessage);
      return [];
    }
  };

  // Add colors to product
  const addColorsToProduct = async (productId: string, colors: string[][]): Promise<any> => {
    try {
      const response = await axios.post(`${BASE_URL}products/${productId}/colors`, {
        storeId: getStoreId(),
        colors: colors
      });

      if (response.data && response.data.success) {
        showSuccess('تم إضافة الألوان بنجاح', 'نجح الإضافة');
        
        // Refresh products list
        await fetchProducts(true);
        
        return response.data.data;
      }
      
      throw new Error('Failed to add colors');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في إضافة الألوان';
      showError(errorMessage, 'خطأ في إضافة الألوان');
      throw err;
    }
  };

  // Remove colors from product
  const removeColorsFromProduct = async (productId: string, colorIndexes: number[]): Promise<any> => {
    try {
      const response = await axios.delete(`${BASE_URL}products/${productId}/colors`, {
        data: {
          storeId: getStoreId(),
          colorIndexes: colorIndexes
        }
      });

      if (response.data && response.data.success) {
        showSuccess('تم حذف الألوان بنجاح', 'نجح الحذف');
        
        // Refresh products list
        await fetchProducts(true);
        
        return response.data.data;
      }
      
      throw new Error('Failed to remove colors');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في حذف الألوان';
      showError(errorMessage, 'خطأ في حذف الألوان');
      throw err;
    }
  };

  // Replace all colors for product
  const replaceProductColors = async (productId: string, colors: string[][]): Promise<any> => {
    try {
      const response = await axios.put(`${BASE_URL}products/${productId}/colors`, {
        storeId: getStoreId(),
        colors: colors
      });

      if (response.data && response.data.success) {
        showSuccess('تم استبدال الألوان بنجاح', 'نجح الاستبدال');
        
        // Refresh products list
        await fetchProducts(true);
        
        return response.data.data;
      }
      
      throw new Error('Failed to replace colors');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'فشل في استبدال الألوان';
      showError(errorMessage, 'خطأ في استبدال الألوان');
      throw err;
    }
  };

  // Get product colors (helper function)
  const getProductColors = (product: any): string[][] => {
    if (!product) return [];
    
    // Check if colors is already an array
    if (Array.isArray(product.colors)) {
      return product.colors;
    }
    
    // If colors is a string, try to parse it
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    
    return [];
  };

  // Add single color to product
  const addSingleColorToProduct = async (productId: string, color: string): Promise<any> => {
    return await addColorsToProduct(productId, [[color]]);
  };

  // Add multiple colors to product
  const addMultipleColorsToProduct = async (productId: string, colors: string[]): Promise<any> => {
    return await addColorsToProduct(productId, [colors]);
  };

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
    uploadMainImage,
    validateProduct,
    resetLoadingState,
    retryFetch,
    addVariant,
    deleteVariant,
    updateVariant,
    fetchProductVariants,
    // New color management functions
    addColorsToProduct,
    removeColorsFromProduct,
    replaceProductColors,
    getProductColors,
    addSingleColorToProduct,
    addMultipleColorsToProduct,
  };
};

export default useProducts; 