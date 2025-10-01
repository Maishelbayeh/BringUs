import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next'; 
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import ProductsLabelsDrawer from './ProductsLabelsDrawer';
import PermissionModal from '../../components/common/PermissionModal';
import useProductLabel from '../../hooks/useProductLabel';

        const ProductsLabels: React.FC = () => {
        const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<any>(null);

  const {
    productLabels,  
    
    fetchProductLabels,
    saveProductLabel,
    deleteProductLabel,
    validateProductLabel
  } = useProductLabel();

  // جلب البيانات عند تحميل الصفحة (مرة واحدة فقط)
  useEffect(() => {
    if (productLabels.length === 0) {
      fetchProductLabels();
    }
  }, [fetchProductLabels, productLabels.length]);

  const handleDelete = async (item: any) => {
    setSelectedLabel(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLabel) {
      try {
        const productLabelId = selectedLabel._id || selectedLabel.id;
        await deleteProductLabel(productLabelId);
        setSelectedLabel(null);
      } catch (error) {
        //CONSOLE.error('Error deleting product label:', error);
      }
    }
    setShowDeleteModal(false);
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
     //CONSOLE.log('form', form);
      const errors = validateProductLabel(form, isRTL);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // حفظ البيانات
      const editId = editingSpec?._id || editingSpec?.id;
      await saveProductLabel(form, editId);
      setDrawerOpen(false);
      setEditingSpec(null);
      setValidationErrors({});
    } catch (error) {
      //CONSOLE.error('Error saving product label:', error);
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
      key: 'name', 
      label: { ar: 'علامة المنتج', en: 'Label' }, 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'description', 
      label: { ar: 'الوصف', en: 'Description' }, 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'isActive', 
      label: { ar: 'الحالة', en: 'Status' }, 
      type: 'status', 
      align: 'center' 
    },
  
  
  
   

  ];

  const lang = i18n.language;
  const tableData = productLabels.map(productLabel => ({
    ...productLabel,
    name: lang === 'ar' || lang === 'ARABIC' ? productLabel.nameAr : productLabel.nameEn,
    description: lang === 'ar' || lang === 'ARABIC' ? productLabel.descriptionAr : productLabel.descriptionEn,
    isActive: productLabel.isActive ? true : false,

   
  }));

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
    { name: t('productsLabels.title') || 'Products Labels', href: '/products-labels' },
  ];

  return (
    <div className="sm:p-4 w-full">
      {/* Breadcrumb */}
      <CustomBreadcrumb items={breadcrumb} isRtl={isRTL} />
      
      <HeaderWithAction
        title={t('productsLabels.title') || 'Products Labels'}
        addLabel={t('productsLabels.add') || 'Add'}
        onAdd={handleAdd}
        isRtl={isRTL}
        count={productLabels.length}
      />
      
      <div className="overflow-x-auto">
        <CustomTable 
          columns={columns as any} 
          data={tableData} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      </div>
      
      <ProductsLabelsDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        onSave={handleDrawerSave} 
        spec={editingSpec}
        validationErrors={validationErrors}
        onFieldChange={handleFieldChange}
      />

      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('productsLabels.deleteConfirmTitle') || 'Confirm Delete Label'}
        message={t('productsLabels.deleteConfirmMessage') || 'Are you sure you want to delete this label?'}
        itemName={selectedLabel ? (isRTL ? selectedLabel.nameAr : selectedLabel.nameEn) : ''}
        itemType={t('productsLabels.label') || 'label'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default ProductsLabels; 