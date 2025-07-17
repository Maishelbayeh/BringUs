import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import useUnits from '../../hooks/useUnits';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import UnitsDrawer from './UnitsDrawer';
import PermissionModal from '../../components/common/PermissionModal';

        const Units: React.FC = () => {
        const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const {
    units,  
    loading,
    fetchUnits,
    saveUnit,
    deleteUnit,
    validateUnit
  } = useUnits();

  // جلب البيانات عند تحميل الصفحة (مرة واحدة فقط)
  useEffect(() => {
    if (units.length === 0) {
      fetchUnits();
    }
  }, [fetchUnits, units.length]);

  const handleDelete = (item: any) => {
    setSelectedUnit(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUnit) {
      try {
        const unitId = selectedUnit._id || selectedUnit.id;
        await deleteUnit(unitId);
        setSelectedUnit(null);
      } catch (error) {
        //CONSOLE.error('Error deleting unit:', error);
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
      // التحقق من صحة البيانات
      const errors = validateUnit(form, isRTL);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // حفظ البيانات
      const editId = editingSpec?._id || editingSpec?.id;
      await saveUnit(form, editId, isRTL);
      setDrawerOpen(false);
      setEditingSpec(null);
      setValidationErrors({});
    } catch (error) {
      //CONSOLE.error('Error saving unit:', error);
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
      label: { ar: 'الوحدة', en: 'Unit' }, 
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
    { 
      key: 'symbol', 
      label: { ar: 'الرمز', en: 'Symbol' }, 
      type: 'text', 
      align: 'center' 
    },  
   

  ];

  const lang = i18n.language;
  const tableData = units.map(unit => ({
    ...unit,
    name: lang === 'ar' || lang === 'ARABIC' ? unit.nameAr : unit.nameEn,
    description: lang === 'ar' || lang === 'ARABIC' ? unit.descriptionAr : unit.descriptionEn,
    isActive: unit.isActive ? true : false,
    symbol: unit.symbol || '',
  }));

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.products') || 'Products', href: '/products' },
    { name: t('units.title') || 'Units', href: '/units' },
  ];

  return (
    <div className="sm:p-4 w-full">
      {/* Breadcrumb */}
      <CustomBreadcrumb items={breadcrumb} isRtl={isRTL} />
      
      <HeaderWithAction
        title={t('units.title') || 'Units'}
        addLabel={t('units.add') || 'Add'}
        onAdd={handleAdd}
        isRtl={isRTL}
        count={units.length}
      />
      
      <div className="overflow-x-auto">
        <CustomTable 
          columns={columns as any} 
          data={tableData} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      </div>
      
      <UnitsDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        onSave={handleDrawerSave} 
        spec={editingSpec}
        validationErrors={validationErrors}
        onFieldChange={handleFieldChange}
      />

      {/* PermissionModal for delete confirmation */}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('units.deleteConfirmTitle') || 'Confirm Delete Unit'}
        message={t('units.deleteConfirmMessage') || 'Are you sure you want to delete this unit?'}
        itemName={selectedUnit ? (isRTL ? selectedUnit.nameAr : selectedUnit.nameEn) : ''}
        itemType={t('units.unit') || 'unit'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default Units; 