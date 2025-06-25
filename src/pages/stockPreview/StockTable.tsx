import React from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '@/components/common/CustomBreadcrumb';
import { initialProducts } from '@/data/initialProducts';
import { initialCategories } from '@/data/initialCategories';
import { productLabelOptions } from '../../data/productLabelOptions';

const StockTable: React.FC = () => {
  const { i18n, t } = useTranslation();
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
        <CustomTable columns={columns as any} data={tableData} />
      </div>
    </div>
  );
};

export default StockTable; 