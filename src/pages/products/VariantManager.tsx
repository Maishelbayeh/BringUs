import React, { useState, useRef } from 'react';
import VariantsPopup from './VariantsPopup';
import ProductsDrawer from './ProductsDrawer';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import useProducts from '../../hooks/useProducts';
import axios from 'axios';
import { BASE_URL } from '../../constants/api';

interface VariantManagerProps {
  isOpen: boolean;
  onClose: () => void;
  variants: any[];
  parentProduct: any;
  onDeleteVariant: (variant: any) => void;
  onUpdateVariant: (productId: string, variantId: string, variantData: any) => Promise<any>;
  onAddVariant: () => void;
  isRTL: boolean;
  categories: any[];
  tags: any[];
  units: any[];
}

const fetchVariantById = async (productId: string, variantId: string, storeId: string) => {
  const res = await axios.get(`${BASE_URL}products/${productId}/variants?storeId=${storeId}`);
  return res.data.data.find((v: any) => v._id === variantId || v.id === variantId);
};

const VariantManager: React.FC<VariantManagerProps> = ({
  isOpen,
  onClose,
  variants,
  parentProduct,
  onDeleteVariant,
  onUpdateVariant,
  onAddVariant,
  isRTL,
  categories,
  tags,
  units
}) => {
  const [showVariantDrawer, setShowVariantDrawer] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [localVariants, setLocalVariants] = useState<any[]>(variants);
  const [isLoading, setIsLoading] = useState(false);
  const productsFormRef = useRef<any>(null);

  // دالة لإعادة تحميل المتغيرات من API
  const refreshVariants = async () => {
    if (!parentProduct) return;
    
    console.log('🔍 VariantManager - Refreshing variants for product:', parentProduct._id);
    
    try {
      const storeId = parentProduct.store?._id || parentProduct.storeId;
      const freshVariants = await fetchProductVariants(parentProduct._id, storeId);
      console.log('🔍 VariantManager - Refreshed variants:', freshVariants);
      setLocalVariants(freshVariants);
    } catch (error) {
      console.error('Error refreshing variants:', error);
    }
  };

  // استخدام hook لجلب مواصفات المنتجات
  const { specifications, fetchSpecifications } = useProductSpecifications();
  
  // استخدام hook لجلب متغيرات المنتج
  const { fetchProductVariants, uploadProductImages, uploadMainImage } = useProducts();

  // جلب المواصفات والمتغيرات عند فتح المكون
  React.useEffect(() => {
    if (isOpen) {
      fetchSpecifications();
      refreshVariants(); // إعادة تحميل المتغيرات عند فتح الـ popup
    }
  }, [isOpen, fetchSpecifications]);

  // Update local variants when props change
  React.useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const handleEditVariant = async (variant: any) => {
      console.log('🔍 VariantManager - handleEditVariant - variant:', variant); 

    if (!parentProduct || !variant) return;
    setIsLoading(true);
    // دالة تطبيع الألوان المتداخلة
    function deepParseColors(input: any): string[][] {
      let arr = input;
      for (let i = 0; i < 5; i++) {
        if (typeof arr === 'string') {
          try {
            arr = JSON.parse(arr);
          } catch {
            break;
          }
        }
      }
      if (Array.isArray(arr) && Array.isArray(arr[0])) {
        return arr.map((sub: any) =>
          Array.isArray(sub)
            ? sub.map((c: any) => (typeof c === 'string' ? c : ''))
            : []
        );
      }
      return [];
    }
        try {
      // استخدم البيانات الموجودة مباشرة بدلاً من جلبها من API
      let freshVariant = { ...variant };
      
      console.log('🔍 VariantManager - Using existing variant data:', {
        categories: freshVariant.categories,
        category: freshVariant.category
      });
      
      // تطبيع unit
      freshVariant.unit = freshVariant.unit?._id || freshVariant.unit?.id || freshVariant.unit || '';
      freshVariant.stock = freshVariant.stock || 0;
      // تطبيع categories - handle both category and categories
      if (freshVariant.categories && Array.isArray(freshVariant.categories)) {
        // If categories array exists, extract IDs
        freshVariant.categoryIds = freshVariant.categories.map((cat: any) => cat._id || cat.id);
        // Keep categoryIds as array for ProductsForm
        freshVariant.categoryId = freshVariant.categoryIds.join(','); // Also keep as string for compatibility
      } else if (freshVariant.category) {
        // If single category exists, convert to array format
        const categoryId = freshVariant.category._id || freshVariant.category.id || freshVariant.category;
        freshVariant.categoryIds = [categoryId];
        freshVariant.categoryId = categoryId;
      } else {
        // If no categories, inherit from parent product
        const parentCategories = parentProduct.categories || parentProduct.categoryIds || [];
        freshVariant.categoryIds = Array.isArray(parentCategories) 
          ? parentCategories.map((cat: any) => cat._id || cat.id || cat)
          : [];
        freshVariant.categoryId = freshVariant.categoryIds.join(','); // Also keep as string for compatibility
      }
      
      console.log('🔍 VariantManager - Processed categories:', {
        originalCategories: freshVariant.categories,
        categoryIds: freshVariant.categoryIds,
        categoryId: freshVariant.categoryId
      });
      
      // تطبيع productLabels
      freshVariant.productLabels = Array.isArray(freshVariant.productLabels)
        ? freshVariant.productLabels.map((l: any) => l._id || l.id || l)
        : [];
      
      // تطبيع specifications
      freshVariant.specifications = Array.isArray(freshVariant.specifications)
        ? freshVariant.specifications.map((s: any) => s._id || s.id || s)
        : [];
      
      // تطبيع الألوان
      let parsedColors: string[][] = [];
      if (Array.isArray(freshVariant.allColors) && freshVariant.allColors.length > 0) {
        freshVariant.allColors.forEach((c: any) => {
          const arr = deepParseColors(c);
          if (arr.length > 0) parsedColors.push(...arr);
        });
      } else if (Array.isArray(freshVariant.colors) && freshVariant.colors.length > 0) {
        freshVariant.colors.forEach((c: any) => {
          const arr = deepParseColors(c);
          if (arr.length > 0) parsedColors.push(...arr);
        });
      }
      freshVariant.colors = parsedColors;
      freshVariant.stock = freshVariant.availableQuantity || 0;
      console.log('🔍 VariantManager - freshVariant:', freshVariant);
      // تطبيع seo
      if (typeof freshVariant.seo === 'string') {
        try {
          freshVariant.seo = JSON.parse(freshVariant.seo);
        } catch {
          freshVariant.seo = {};
        }
      }
      
      console.log('🔍 VariantManager - Final editingVariant before setting:', {
        categoryIds: freshVariant.categoryIds,
        categoryId: freshVariant.categoryId,
        categories: freshVariant.categories
      });
      
      setEditingVariant(freshVariant);
      setShowVariantDrawer(true);
      
    } catch (error) {
      console.error('Error processing variant data:', error);
      setEditingVariant(variant);
      setShowVariantDrawer(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantDrawerClose = () => {
    setShowVariantDrawer(false);
    setEditingVariant(null);
  };

  const handleVariantFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingVariant) return;
    const { name, value } = e.target;
    
    if (name === 'colors') {
      // التعامل مع الألوان كمصفوفة
      console.log('🔍 VariantManager - colors received:', value);
      console.log('🔍 VariantManager - colors type:', typeof value);
      console.log('🔍 VariantManager - colors is array:', Array.isArray(value));
      
      let colorsValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        colorsValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          colorsValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          colorsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const colorsArray = Array.isArray(colorsValue) ? colorsValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        colors: colorsArray
      }));
    } else if (name === 'barcodes') {
      // التعامل مع الباركود كمصفوفة
      let barcodesValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        barcodesValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          barcodesValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كنص واحد
          barcodesValue = [value];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const barcodesArray = Array.isArray(barcodesValue) ? barcodesValue : [barcodesValue];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        barcodes: barcodesArray
      }));
    } else if (name === 'mainImage') {
      // التعامل مع الصورة الأساسية
      setEditingVariant((prev: any) => ({
        ...prev,
        mainImage: value
      }));
    } else if (name === 'unitId') {
      // تحديث unitId و unit معاً
      setEditingVariant((prev: any) => ({
        ...prev,
        unitId: value,
        unit: value
      }));
    } else if (name === 'unit') {
      // تحديث unit و unitId معاً
      setEditingVariant((prev: any) => ({
        ...prev,
        unit: value,
        unitId: value
      }));
    } else if (name === 'productLabels') {
      // التعامل مع productLabels كمصفوفة
      let productLabelsValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        productLabelsValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          productLabelsValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          productLabelsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const productLabelsArray = Array.isArray(productLabelsValue) ? productLabelsValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        productLabels: productLabelsArray
      }));
    } else if (name === 'specifications') {
      // التعامل مع specifications كمصفوفة
      let specificationsValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        specificationsValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          specificationsValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          specificationsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const specificationsArray = Array.isArray(specificationsValue) ? specificationsValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        specifications: specificationsArray
      }));
    } else if (name === 'specificationValues') {
      // التعامل مع specificationValues كمصفوفة
      let specificationValuesValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        specificationValuesValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          specificationValuesValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          specificationValuesValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const specificationValuesArray = Array.isArray(specificationValuesValue) ? specificationValuesValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        specificationValues: specificationValuesArray
      }));
    } else if (name === 'categoryIds') {
      // التعامل مع categoryIds كمصفوفة
      let categoryIdsValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        categoryIdsValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          categoryIdsValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          categoryIdsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const categoryIdsArray = Array.isArray(categoryIdsValue) ? categoryIdsValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        categoryIds: categoryIdsArray
      }));
    } else if (name === 'selectedSpecifications') {
      // التعامل مع selectedSpecifications
      setEditingVariant((prev: any) => ({
        ...prev,
        selectedSpecifications: value
      }));
    } else if (name === 'newBarcode') {
      // التعامل مع newBarcode
      setEditingVariant((prev: any) => ({
        ...prev,
        newBarcode: value
      }));
    } else if (name === 'tags') {
      // التعامل مع tags كمصفوفة
      let tagsValue: any = value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(value)) {
        tagsValue = value;
      } else if (typeof value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          tagsValue = JSON.parse(value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          tagsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const tagsArray = Array.isArray(tagsValue) ? tagsValue : [];
      
      setEditingVariant((prev: any) => ({
        ...prev,
        tags: tagsArray
      }));
    } else if (name === 'maintainStock') {
      if (value === 'N') {
        setEditingVariant((prev: any) => ({
          ...prev,
          maintainStock: 'N',
          availableQuantity: 0
        }));
      } else {
        setEditingVariant((prev: any) => ({
          ...prev,
          maintainStock: 'Y'
        }));
      }
    } else if (name === 'availableQuantity') {
      const val = value;
      const numVal = val === '' ? 0 : Number(val);
      if (!numVal || numVal <= 0) {
        setEditingVariant((prev: any) => ({
          ...prev,
          availableQuantity: numVal,
          maintainStock: 'N'
        }));
      } else {
        setEditingVariant((prev: any) => ({
          ...prev,
          availableQuantity: numVal,
          maintainStock: 'Y'
        }));
      }
    } else if (name === 'lowStockThreshold') {
      const val = value;
      const numVal = val === '' ? 10 : Number(val);
      setEditingVariant((prev: any) => ({
        ...prev,
        lowStockThreshold: numVal
      }));
    } else if (name === 'videoUrl') {
      // التعامل مع productVideo
      setEditingVariant((prev: any) => ({
        ...prev,
        videoUrl: value
      }));
    } else if (name === 'isOnSale') {
      // التعامل مع isOnSale
      setEditingVariant((prev: any) => ({
        ...prev,
        isOnSale: value
      }));
    } else if (name === 'salePercentage') {
      // التعامل مع salePercentage
      setEditingVariant((prev: any) => ({
        ...prev,
        salePercentage: value
      }));
    } else if (name === 'productOrder') {
      // التعامل مع productOrder
      setEditingVariant((prev: any) => ({
        ...prev,
        productOrder: value
      }));
    } else if (name === 'visibility') {
      // التعامل مع visibility
      setEditingVariant((prev: any) => ({
        ...prev,
        visibility: value
      }));
    } else if (name === 'subcategoryId') {
      // التعامل مع subcategoryId
      setEditingVariant((prev: any) => ({
        ...prev,
        subcategoryId: value
      }));
    } else if (name === 'storeId') {
      // التعامل مع storeId
      setEditingVariant((prev: any) => ({
        ...prev,
        storeId: value
      }));
    } else if (name === 'nameAr' || name === 'nameEn' || name === 'descriptionAr' || name === 'descriptionEn') {
      // التعامل مع النصوص
      setEditingVariant((prev: any) => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'price' || name === 'costPrice' || name === 'compareAtPrice' || name === 'originalPrice') {
      // التعامل مع الأسعار
      setEditingVariant((prev: any) => ({
        ...prev,
        [name]: value
      }));
    } else {
      // التعامل مع الحقول الأخرى
      setEditingVariant((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVariantTagsChange = (values: string[]) => {
    console.log('🔍 VariantManager - handleTagsChange called with values:', values);
    console.log('🔍 VariantManager - values type:', typeof values);
    console.log('🔍 VariantManager - values is array:', Array.isArray(values));
    setEditingVariant((prev: any) => ({
      ...prev,
      productLabels: values
    }));
  };

  const handleVariantImageChange = async (files: File | File[] | null) => {
    if (!files) {
      setEditingVariant((prev: any) => ({
        ...prev,
        images: []
      }));
      return;
    }

    try {
      const fileArray = Array.isArray(files) ? files : [files];
      
      // رفع الصور إلى Cloudflare
      const uploadedUrls = await uploadProductImages(fileArray);
      
      // تحديث النموذج بالروابط الجديدة
      setEditingVariant((prev: any) => ({
        ...prev,
        images: uploadedUrls
      }));
      
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      // في حالة الخطأ، نستخدم الروابط المحلية كـ fallback
      const fileArray = Array.isArray(files) ? files : [files];
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      setEditingVariant((prev: any) => ({
        ...prev,
        images: imageUrls
      }));
    }
  };

  const handleVariantMainImageChange = async (file: File | null) => {
    if (!file) {
      setEditingVariant((prev: any) => ({
        ...prev,
        mainImage: null
      }));
      return;
    }

    try {
      // رفع الصورة الرئيسية إلى Cloudflare
      const uploadedUrl = await uploadMainImage(file);
      
      // تحديث النموذج بالرابط الجديد
      setEditingVariant((prev: any) => ({
        ...prev,
        mainImage: uploadedUrl
      }));
      
    } catch (error) {
      console.error('❌ Error uploading main image:', error);
      // في حالة الخطأ، نستخدم الرابط المحلي كـ fallback
      const imageUrl = URL.createObjectURL(file);
      setEditingVariant((prev: any) => ({
        ...prev,
        mainImage: imageUrl
      }));
    }
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant || !parentProduct) return;
    setIsLoading(true);
    try {
      console.log('🔍 VariantManager - Updating variant:', editingVariant.categoryIds);
      
      // جلب الباركود من ProductsForm مباشرة (حتى لو لم يضغط +)
      if (productsFormRef.current && typeof productsFormRef.current.getCurrentBarcode === 'function') {
        const currentBarcode = productsFormRef.current.getCurrentBarcode();
        if (currentBarcode && currentBarcode.trim() && !editingVariant.barcodes.includes(currentBarcode.trim())) {
          editingVariant.barcodes = [...editingVariant.barcodes, currentBarcode.trim()];
          setEditingVariant({ ...editingVariant });
        }
      }
      
      // تحويل البيانات إلى الشكل المطلوب للـ API
      const variantData = {
        ...editingVariant,
        selectedSpecifications: editingVariant.selectedSpecifications || '',
        newBarcode: editingVariant.newBarcode || '',
        tags: editingVariant.tags || [],
        images: editingVariant.images || [],
        mainImage: editingVariant.mainImage || null,
        specifications: Array.isArray(editingVariant.specifications) ? editingVariant.specifications : [],
        specificationValues: Array.isArray(editingVariant.specificationValues) ? editingVariant.specificationValues : [],
        productLabels: (() => {
          // Use tags if available, otherwise use productLabels
          const labels = editingVariant.productLabels || [];
          console.log('🔍 VariantManager - Final productLabels to send:', labels);
          return labels;
        })(),
        barcodes: Array.isArray(editingVariant.barcodes) ? editingVariant.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [],
        categoryIds: editingVariant.categoryIds || [],
        unitId: editingVariant.unitId || editingVariant.unit || null,
        categoryId: editingVariant.categoryId || null,
        subcategoryId: editingVariant.subcategoryId || null,
        storeId: editingVariant.storeId || parentProduct.storeId || parentProduct.store?._id || '',
        availableQuantity: parseInt(String(editingVariant.availableQuantity)) || 0,
        stock: parseInt(String(editingVariant.availableQuantity)) || 0,
        maintainStock: editingVariant.maintainStock || 'Y',
        lowStockThreshold: parseInt(String(editingVariant.lowStockThreshold)) || 10,
        price: parseFloat(editingVariant.price) || 0,
        costPrice: parseFloat(editingVariant.costPrice) || 0,
        compareAtPrice: parseFloat(editingVariant.compareAtPrice) || 0,
        originalPrice: parseFloat(editingVariant.originalPrice) || 0,
        nameAr: editingVariant.nameAr || '',
        nameEn: editingVariant.nameEn || '',
        descriptionAr: editingVariant.descriptionAr || '',
        descriptionEn: editingVariant.descriptionEn || '',
        isOnSale: editingVariant.isOnSale === 'true',
        salePercentage: parseFloat(editingVariant.salePercentage) || 0,
        productOrder: parseInt(String(editingVariant.productOrder)) || 0,
        isActive: true,
        videoUrl: editingVariant.videoUrl || '',
        colors: (() => {
          console.log('🔍 VariantManager - editingVariant.colors:', editingVariant.colors);
          console.log('🔍 VariantManager - editingVariant.colors type:', typeof editingVariant.colors);
          console.log('🔍 VariantManager - editingVariant.colors is array:', Array.isArray(editingVariant.colors));
          
          if (Array.isArray(editingVariant.colors)) {
            const processedColors = editingVariant.colors.map((variant: any) => {
              console.log('🔍 VariantManager - Processing variant:', variant);
              console.log('🔍 VariantManager - Variant type:', typeof variant);
              console.log('🔍 VariantManager - Variant is array:', Array.isArray(variant));
              
              // إذا كان variant مصفوفة ألوان مباشرة (من convertedColors)
              if (Array.isArray(variant)) {
                console.log('🔍 VariantManager - Returning variant as array:', variant);
                return variant;
              }
              // إذا كان variant يحتوي على colors property (من CustomColorPicker)
              else if (variant && typeof variant === 'object' && Array.isArray(variant.colors)) {
                console.log('🔍 VariantManager - Returning variant.colors:', variant.colors);
                return variant.colors;
              }
              // إذا كان لون واحد
              else if (typeof variant === 'string') {
                console.log('🔍 VariantManager - Returning single color as array:', [variant]);
                return [variant];
              }
              // إذا كان null أو undefined
              else {
                console.log('🔍 VariantManager - Returning empty array for null/undefined variant');
                return [];
              }
            }).filter((colors: string[]) => colors.length > 0); // إزالة المصفوفات الفارغة
            
            console.log('🔍 VariantManager - Final processed colors:', processedColors);
            return processedColors;
          } else {
            console.log('🔍 VariantManager - editingVariant.colors is not an array, returning empty array');
            return [];
          }
        })(),
      };
      
      // تحديث المتغير
      const updatedVariant = await onUpdateVariant(parentProduct._id, editingVariant._id, variantData);
      
      console.log('🔍 VariantManager - Variant updated successfully:', updatedVariant);
      
      // إعادة تحميل المتغيرات من API لجلب البيانات المحدثة
      await refreshVariants();
      
      setShowVariantDrawer(false);
      setEditingVariant(null);
      
      // عرض رسالة نجاح
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariant = async (variant: any) => {
    try {
      const confirmed = window.confirm(
        isRTL 
          ? `هل أنت متأكد من حذف المتغير "${variant.nameAr || variant.nameEn}"؟`
          : `Are you sure you want to delete the variant "${variant.nameAr || variant.nameEn}"?`
      );

      if (!confirmed) return;

      await onDeleteVariant(variant);
      
      // إعادة تحميل المتغيرات من API لجلب البيانات المحدثة
      await refreshVariants();
      
      // Show success message
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  return (
    <>
      <VariantsPopup
        isOpen={isOpen}
        onClose={onClose}
        variants={localVariants}
        parentProduct={parentProduct}
        onEditVariant={handleEditVariant}
        onDeleteVariant={handleDeleteVariant}
        onAddVariant={onAddVariant}
        isRTL={isRTL}
        isLoading={isLoading}
      />
      <ProductsDrawer
        open={showVariantDrawer}
        onClose={handleVariantDrawerClose}
        isRTL={isRTL}
        title={isRTL ? 'تعديل متغير' : 'Edit Variant'}
        drawerMode="variant"
        form={editingVariant}
        onFormChange={handleVariantFormChange}
        onTagsChange={handleVariantTagsChange}
        onImageChange={handleVariantImageChange}
        onMainImageChange={handleVariantMainImageChange}
        uploadMainImage={uploadMainImage}
        onSubmit={handleVariantSubmit}
        categories={categories}
        tags={tags}
        units={units}
        specifications={specifications}
        validationErrors={{}}
        onFieldValidation={() => {}}
        showValidation={false}
        productsFormRef={productsFormRef}
      />
    </>
  );
};

export default VariantManager; 