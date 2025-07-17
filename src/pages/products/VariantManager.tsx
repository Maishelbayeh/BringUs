import React, { useState } from 'react';
import VariantsPopup from './VariantsPopup';
import VariantEditDrawer from './VariantEditDrawer';
import useProductSpecifications from '../../hooks/useProductSpecifications';

interface VariantManagerProps {
  isOpen: boolean;
  onClose: () => void;
  variants: any[];
  parentProduct: any;
  onDeleteVariant: (variant: any) => void;
  onUpdateVariant: (productId: string, variantId: string, variantData: any) => Promise<any>;
  onAddVariant: () => void;
  isRTL: boolean;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  isOpen,
  onClose,
  variants,
  parentProduct,
  onDeleteVariant,
  onUpdateVariant,
  onAddVariant,
  isRTL
}) => {
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [showVariantEditDrawer, setShowVariantEditDrawer] = useState(false);
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

  const handleEditVariant = (variant: any) => {
 //   console.log('🔍 handleEditVariant - Editing variant:', variant);
    setEditingVariant(variant);
    setShowVariantEditDrawer(true);
  };

  const handleVariantEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVariant || !parentProduct) {
   //   console.error('❌ No variant or parent product selected for editing');
      return;
    }

    try {
      setIsLoading(true);
   //   console.log('🔍 handleVariantEditSubmit - Submitting variant edit:', editingVariant);
      
      // Prepare variant data for update
      const variantData = {
        nameAr: editingVariant.nameAr,
        nameEn: editingVariant.nameEn,
        descriptionAr: editingVariant.descriptionAr,
        descriptionEn: editingVariant.descriptionEn,
        price: editingVariant.price,
        compareAtPrice: editingVariant.compareAtPrice,
        costPrice: editingVariant.costPrice,
        availableQuantity: editingVariant.availableQuantity,
        barcodes: editingVariant.barcodes || [],
        // Handle specifications properly - ensure it's a valid array
        specifications: (() => {
          // For variants, we typically don't need to send specifications array
          // as the specificationValues contain the actual selected values
          // So we'll send an empty array to avoid casting errors
          return [];
        })(),
        specificationValues: (() => {
          if (Array.isArray(editingVariant.specificationValues)) {
            // Clean up the specificationValues to ensure proper format
            return editingVariant.specificationValues
              .filter((spec: any) => spec && spec.specificationId && spec.valueId && spec.value && spec.title)
              .map((spec: any) => ({
                specificationId: spec.specificationId,
                valueId: spec.valueId,
                value: spec.value,
                title: spec.title
                // Remove _id to avoid conflicts with MongoDB
              }));
          } else if (typeof editingVariant.specificationValues === 'string') {
            try {
              const parsed = JSON.parse(editingVariant.specificationValues);
              if (Array.isArray(parsed)) {
                return parsed
                  .filter((spec: any) => spec && spec.specificationId && spec.valueId && spec.value && spec.title)
                  .map((spec: any) => ({
                    specificationId: spec.specificationId,
                    valueId: spec.valueId,
                    value: spec.value,
                    title: spec.title
                    // Remove _id to avoid conflicts with MongoDB
                  }));
              }
              return [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
        mainImage: editingVariant.mainImage,
        images: editingVariant.images || []
      };

      // Call the updateVariant API
      await onUpdateVariant(parentProduct._id, editingVariant._id, variantData);
      
      // Update the local variants list
      setLocalVariants(prev => 
        prev.map(v => v._id === editingVariant._id ? { ...v, ...variantData } : v)
      );
      
      // Close the drawer
      setShowVariantEditDrawer(false);
      setEditingVariant(null);
      
      // Show success message
      if (isRTL) {
        alert('تم تحديث المتغير بنجاح');
      } else {
        alert('Variant updated successfully');
      }
    } catch (error) {
      //console.error('❌ handleVariantEditSubmit - Error:', error);
      if (isRTL) {
        alert('حدث خطأ أثناء تحديث المتغير');
      } else {
        alert('Error updating variant');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantEditClose = () => {
    setShowVariantEditDrawer(false);
    setEditingVariant(null);
  };

  const handleVariantEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingVariant) return;
    
    const { name, value } = e.target;
    console.log('🔍 VariantManager - handleVariantEditFormChange:', { name, value, valueType: typeof value });
    
    setEditingVariant((prev: any) => ({
      ...prev,
      [name]: value
    }));
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
 //     console.error('❌ handleDeleteVariant - Error:', error);
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
      
      <VariantEditDrawer
        isOpen={showVariantEditDrawer}
        onClose={handleVariantEditClose}
        variant={editingVariant}
        onFormChange={handleVariantEditFormChange}
        onSubmit={handleVariantEditSubmit}
        isRTL={isRTL}
        isLoading={isLoading}
        specifications={specifications}
      />
    </>
  );
};

export default VariantManager; 