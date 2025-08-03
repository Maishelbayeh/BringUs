import React, { useState } from 'react';
import VariantsPopup from './VariantsPopup';
import ProductsDrawer from './ProductsDrawer';
import useProductSpecifications from '../../hooks/useProductSpecifications';
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

  // استخدام hook لجلب مواصفات المنتجات
  const { specifications, fetchSpecifications } = useProductSpecifications();

  // جلب المواصفات عند فتح المكون
  React.useEffect(() => {
    if (isOpen) {
      fetchSpecifications();
    }
  }, [isOpen, fetchSpecifications]);

  // Update local variants when props change
  React.useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const handleEditVariant = async (variant: any) => {
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
      const storeId = parentProduct.store?._id || parentProduct.storeId;
      // استخدم الـ API الجديد لجلب بيانات المتغير
      const res = await fetch(
        `/api/products/${parentProduct._id}/variants/${variant._id}?storeId=${storeId}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          let freshVariant = data.data;
          // تطبيع unit
          freshVariant.unit = freshVariant.unit?._id || freshVariant.unit?.id || freshVariant.unit || '';
          // تطبيع category
          freshVariant.category = freshVariant.category?._id || freshVariant.category?.id || freshVariant.category || '';
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
          setEditingVariant(freshVariant);
          setShowVariantDrawer(true);
          return;
        }
      }
      setEditingVariant(variant);
      setShowVariantDrawer(true);
    } catch (error) {
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
      await onUpdateVariant(parentProduct._id, editingVariant._id, editingVariant);
      setShowVariantDrawer(false);
      setEditingVariant(null);
      // يمكنك عرض رسالة نجاح هنا إذا أردت
    } catch (error) {
      // يمكنك عرض رسالة خطأ هنا إذا أردت
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
      // Update local variants list
      setLocalVariants(prev => prev.filter(v => v._id !== variant._id));
      // Show success message
      if (isRTL) {
        alert('تم حذف المتغير بنجاح');
      } else {
        alert('Variant deleted successfully');
      }
    } catch (error) {
      if (isRTL) {
        alert('حدث خطأ أثناء حذف المتغير');
      } else {
        alert('Error deleting variant');
      }
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