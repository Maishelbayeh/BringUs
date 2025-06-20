import React from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '@/components/common/CustomBreadcrumb';

const mockProducts = [
  { name: 'آيفون 15 برو', category: 'الكترونيات', subcategory: 'هواتف', stock: 3, visibility: true },
  { name: 'سامسونج S23', category: 'الكترونيات', subcategory: 'هواتف', stock: 25, visibility: true },
  { name: 'ماك بوك برو', category: 'الكترونيات', subcategory: 'لابتوبات', stock: 0, visibility: false },
  { name: 'تيشيرت رجالي', category: 'ملابس', subcategory: 'رجالي', stock: 8, visibility: true },
  { name: 'فستان نسائي', category: 'ملابس', subcategory: 'نسائي', stock: 60, visibility: true },
  { name: 'كنزة أطفال', category: 'ملابس', subcategory: 'أطفال', stock: 15, visibility: false },
  { name: 'كنبة زاوية', category: 'أثاث', subcategory: 'غرفة معيشة', stock: 2, visibility: true },
  { name: 'سرير مزدوج', category: 'أثاث', subcategory: 'غرفة نوم', stock: 12, visibility: true },
  { name: 'مكتب دراسة', category: 'أثاث', subcategory: '', stock: 55, visibility: false },
  { name: 'ساعة ذكية', category: 'الكترونيات', subcategory: '', stock: 100, visibility: true },
  { name: 'حذاء رياضي', category: 'ملابس', subcategory: 'رجالي', stock: 9, visibility: true },
  { name: 'جاكيت شتوي', category: 'ملابس', subcategory: 'نسائي', stock: 40, visibility: false },
  { name: 'ثلاجة سامسونج', category: 'الكترونيات', subcategory: 'أجهزة منزلية', stock: 6, visibility: true },
  { name: 'غسالة إل جي', category: 'الكترونيات', subcategory: 'أجهزة منزلية', stock: 18, visibility: true },
  { name: 'مكتبة كتب', category: 'أثاث', subcategory: 'مكتبة', stock: 0, visibility: false },
  { name: 'كرسي مكتب', category: 'أثاث', subcategory: '', stock: 27, visibility: true },
  { name: 'بنطال جينز', category: 'ملابس', subcategory: 'رجالي', stock: 13, visibility: true },
  { name: 'بلوزة قطنية', category: 'ملابس', subcategory: 'نسائي', stock: 51, visibility: true },
  { name: 'مكيف هواء', category: 'الكترونيات', subcategory: 'أجهزة منزلية', stock: 4, visibility: false },
  { name: 'خزانة ملابس', category: 'أثاث', subcategory: 'غرفة نوم', stock: 35, visibility: true },
];
const StockTable: React.FC = () => {
  const { i18n, t } = useTranslation();
  const columns = [
    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text', align: 'center' },
    { key: 'category', label: { ar: 'التصنيف', en: 'Category' }, type: 'text', align: 'center' },
    { key: 'subcategory', label: { ar: 'التصنيف الفرعي', en: 'Subcategory' }, type: 'text', align: 'center' },
    { key: 'stock', label: { ar: 'الكمية المتبقية', en: 'Stock Left' }, type: 'number', align: 'center' },
    { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'text', align: 'center' },
  ];

  // تجهيز البيانات للجدول مع ترجمة الفيزابيليتي
  const tableData = mockProducts.map(p => ({
    ...p,
    visibility: p.visibility
      ? (i18n.language === 'ARABIC' ? 'ظاهر' : 'Visible')
      : (i18n.language === 'ARABIC' ? 'مخفي' : 'Hidden'),
    subcategory: p.subcategory || (i18n.language === 'ARABIC' ? '-' : '-'),
  }));

  return (
    <div className="p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.stockPreview') || 'Stock Preview', href: '/stock-preview' }
      ]} isRtl={i18n.language === 'ARABIC'} />
      <HeaderWithAction
        title={t('stockPreview.title')}
        isRtl={i18n.language === 'ARABIC'}
      />
      <div className="overflow-x-auto ">
        <CustomTable columns={columns as any} data={tableData} />
      </div>
    </div>
  );
};

export default StockTable; 