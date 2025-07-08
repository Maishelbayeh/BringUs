import React, { useState } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '@/components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { initialProducts } from '@/data/initialProducts';
import { initialCategories } from '@/data/initialCategories';
import { productLabelOptions } from '../../data/productLabelOptions';

const StockTable: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  
  const columns = [
    { key: 'image', label: { ar: 'الصورة', en: 'Image' }, type: 'image' },
    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' },
    { key: 'category', label: { ar: 'الفئة', en: 'Category' }, type: 'text' },
    { key: 'label', label: { ar: 'التصنيف', en: 'Label' }, type: 'text' },
    { key: 'availableQuantity', label: { ar: 'الكمية المتبقية', en: 'Stock Left' }, type: 'number' },
    { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'text' },
  ];

//------------------------------------------- getCategoryName -------------------------------------------
  const getCategoryName = (id: number) => {
    const cat = initialCategories.find((c: any) => c.id === id);
    return cat ? (i18n.language === 'ARABIC' ? cat.nameAr : cat.nameEn) : '-';
  };
//------------------------------------------- getLabelName -------------------------------------------
  const getLabelName = (id: number) => {
    const label = productLabelOptions.find((l: any) => l.id === id);
    return label ? (i18n.language === 'ARABIC' ? label.nameAr : label.nameEn) : '-';
  };
//------------------------------------------- tableData -------------------------------------------
  const tableData = initialProducts.map((p: any) => ({
    image: p.image,
    name: i18n.language === 'ARABIC' ? p.nameAr : p.nameEn,
    label: getLabelName(p.productLabel),
    category: getCategoryName(p.categoryId),
    availableQuantity: p.availableQuantity,
    visibility: p.visibility === true
      ? (i18n.language === 'ARABIC' ? 'ظاهر' : 'Visible')
      : (i18n.language === 'ARABIC' ? 'مخفي' : 'Hidden'),
  }));
  
  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      // في التطبيق الحقيقي، هنا سيتم إرسال طلب حذف للخادم
      console.log('Deleting product from stock:', productToDelete);
      setProductToDelete(null);
    }
    setShowDeleteModal(false);
  };

//------------------------------------------- return -------------------------------------------
  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.stockPreview') || 'Stock Preview', href: '/stock-preview' }
      ]} isRtl={i18n.language === 'ARABIC'} />
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('stockPreview.title')}
        isRtl={i18n.language === 'ARABIC'}
        count={tableData.length}
      />
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto ">
        <CustomTable columns={columns as any} data={tableData} onDelete={handleDelete} />
      </div>
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('stockPreview.deleteConfirmTitle') || 'Confirm Delete Product from Stock'}
        message={t('stockPreview.deleteConfirmMessage') || 'Are you sure you want to delete this product from stock?'}
        itemName={productToDelete ? productToDelete.name : ''}
        itemType={t('stockPreview.product') || 'product'}
        isRTL={i18n.language === 'ARABIC'}
        severity="danger"
      />
    </div>
  );
};

export default StockTable; 