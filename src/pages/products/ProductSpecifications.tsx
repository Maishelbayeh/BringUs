import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import ProductSpecificationsDrawer from './ProductSpecificationsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';

const ProductSpecifications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const {
    specifications,
    loading,
    fetchSpecifications,
    saveSpecification,
    deleteSpecification,
    validateSpecification
  } = useProductSpecifications();

  // جلب البيانات عند تحميل الصفحة (مرة واحدة فقط)
  useEffect(() => {
    if (specifications.length === 0) {
      fetchSpecifications();
    }
  }, [fetchSpecifications, specifications.length]);

  const handleDelete = async (item: any) => {
    try {
      await deleteSpecification(item._id || item.id);
    } catch (error) {
      //CONSOLE.error('Error deleting specification:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingSpec(item);
    setDrawerOpen(true);
    setValidationErrors({});
  };

  const handleAdd = () => {
    setEditingSpec(null);
    setDrawerOpen(true);
    setValidationErrors({});
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingSpec(null);
    setValidationErrors({});
  };

  const handleDrawerSave = async (form: any) => {
    try {
      // التحقق من صحة البيانات
      const errors = validateSpecification(form, isRTL);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // حفظ البيانات
      await saveSpecification(form, editingSpec?._id || editingSpec?.id, isRTL);
      setDrawerOpen(false);
      setEditingSpec(null);
      setValidationErrors({});
    } catch (error) {
      //CONSOLE.error('Error saving specification:', error);
    }
  };

  const handleFieldChange = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const columns = [
    { 
      key: 'description', 
      label: { ar: 'وصف المواصفة', en: 'Specification Description' }, 
      type: 'text', 
      align: 'center' 
    },
   

  ];

  const lang = i18n.language;
  const tableData = specifications.map(spec => ({
    ...spec,
    description: lang === 'ar' || lang === 'ARABIC' ? spec.descriptionAr : spec.descriptionEn,
    category: spec.category ? (lang === 'ar' || lang === 'ARABIC' ? spec.category.nameAr : spec.category.nameEn) : (isRTL ? 'بدون تصنيف' : 'No Category')
  }));

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.products') || 'Products', href: '/products' },
    { name: t('products.productSpecifications') || 'Product Specifications', href: '/products/specifications' },
  ];

  return (
    <div className="sm:p-4 w-full">
      {/* Breadcrumb */}
      <CustomBreadcrumb items={breadcrumb} isRtl={isRTL} />
      
      <HeaderWithAction
        title={t('products.productSpecifications') || 'Product Specifications'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleAdd}
        isRtl={isRTL}
        count={specifications.length}
      />
      
      <div className="overflow-x-auto">
        <CustomTable 
          columns={columns as any} 
          data={tableData} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      </div>
      
      <ProductSpecificationsDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        onSave={handleDrawerSave} 
        spec={editingSpec}
        validationErrors={validationErrors}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

export default ProductSpecifications; 