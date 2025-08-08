import React, { useState } from 'react';
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
  const { fetchProductVariants } = useProducts();

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
    setEditingVariant((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantTagsChange = (tags: string[]) => {
    setEditingVariant((prev: any) => ({
      ...prev,
      productLabels: tags
    }));
  };

  const handleVariantImageChange = (images: any) => {
    setEditingVariant((prev: any) => ({
      ...prev,
      images
    }));
  };

  const handleVariantMainImageChange = (mainImage: any) => {
    setEditingVariant((prev: any) => ({
      ...prev,
      mainImage
    }));
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant || !parentProduct) return;
    setIsLoading(true);
    try {
      console.log('🔍 VariantManager - Updating variant:', editingVariant.categoryIds);
      
      // تحديث المتغير
      const updatedVariant = await onUpdateVariant(parentProduct._id, editingVariant._id, editingVariant);
      
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
        onSubmit={handleVariantSubmit}
        categories={categories}
        tags={tags}
        units={units}
        specifications={specifications}
        // مرر أي props أخرى لازمة
      />
    </>
  );
};

export default VariantManager; 