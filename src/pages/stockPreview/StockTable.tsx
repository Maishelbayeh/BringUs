import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import { productLabelOptions } from '../../data/productLabelOptions';
import CircularIndeterminate from '../../components/common/loading/CircularIndeterminate';
import { CheckCircle, Inventory2, WarningAmber } from '@mui/icons-material';
const StockTable: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // Use hooks to get data
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  
  const columns = [
    { key: 'image', label: { ar: 'الصورة', en: 'Image' }, type: 'image' },
    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' },
    // { key: 'category', label: { ar: 'الفئة', en: 'Category' }, type: 'text' },
    // { key: 'label', label: { ar: 'التصنيف', en: 'Label' }, type: 'text' },
    { 
      key: 'availableQuantity', 
      label: { ar: 'الكمية المتبقية', en: 'Stock Left' }, 
      type: 'number',
      render: (value: number, row: any) => {
        let colorClass = 'bg-green-100 text-green-800';
        let badge = null;
        if (value === 0) {
          colorClass = 'bg-red-100 text-red-800';
          badge = (
            <span className="text-xs text-white bg-red-600 px-2 py-1 rounded ml-2">
              {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'منتهي' : 'Out of Stock'}
            </span>
          );
        } else if (row.isLowStock) {
          colorClass = 'bg-yellow-100 text-yellow-800';
          badge = (
            <span className="text-xs text-yellow-800 bg-yellow-200 px-2 py-1 rounded ml-2">
              {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock'}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2 justify-center">
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}>
              {value}
            </span>
            {badge}
          </div>
        );
      }
    },
    // { 
    //   key: 'stockStatus', 
    //   label: { ar: 'حالة المخزون', en: 'Stock Status' }, 
    //   type: 'text',
    //   render: (value: string, row: any) => (
    //     <span className={`
    //       px-3 py-1 rounded-full text-sm font-medium
    //       ${row.isLowStock 
    //         ? 'bg-red-100 text-red-800' 
    //         : 'bg-green-100 text-green-800'
    //       }
    //     `}>
    //       {row.isLowStock 
    //         ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock')
    //         : (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock')
    //       }
    //     </span>
    //   )
    // },
    // { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'text' },
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('Error loading stock data:', error);
      }
    };

    loadData();
  }, [fetchProducts, fetchCategories]);

//------------------------------------------- getCategoryName -------------------------------------------
  const getCategoryName = (categoryId: string | number) => {
    if (!categories || categories.length === 0) return '-';
    
    const category = categories.find((c: any) => c._id === categoryId || c.id === categoryId);
    if (!category) return '-';
    
    return i18n.language === 'ar' || i18n.language === 'ARABIC' 
      ? category.nameAr || category.name
      : category.nameEn || category.name;
  };

//------------------------------------------- getLabelName -------------------------------------------
  const getLabelName = (labelId: number | string) => {
    const label = productLabelOptions.find((l: any) => l.id === labelId || l._id === labelId);
    return label ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? label.nameAr : label.nameEn) : '-';
  };

//------------------------------------------- tableData -------------------------------------------
  const tableData = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map((product: any) => {
      const currentQuantity = product.availableQuantity || product.quantity || 0;
      const lowStockThreshold = product.lowStockThreshold || 10; // Default threshold 10 if not set
      const isLowStock = currentQuantity <= lowStockThreshold;

      return {
        _id: product._id,
        image: product.image || product.images?.[0] || '/placeholder-image.png',
        name: i18n.language === 'ar' || i18n.language === 'ARABIC' 
          ? product.nameAr || product.name
          : product.nameEn || product.name,
        // label: getLabelName(product.productLabel || product.label),
        // category:   i18n.language === 'ar' || i18n.language === 'ARABIC' ? product.category.nameAr : product.category.nameEn,
        availableQuantity: currentQuantity,
        isLowStock: isLowStock,
        stockStatus: isLowStock 
          ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock')
          : (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock'),
        lowStockThreshold: lowStockThreshold,
        // visibility: product.visibility === true || product.isVisible === true
        //   ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'ظاهر' : 'Visible')
        //   : (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخفي' : 'Hidden'),
      };
    });
  }, [products, categories, i18n.language]);

  // Filter data based on low stock filter
  const filteredData = React.useMemo(() => {
    if (!showLowStockOnly) return tableData;
    return tableData.filter(item => item.isLowStock);
  }, [tableData, showLowStockOnly]);

  // Calculate statistics
  const stockStats = React.useMemo(() => {
    const totalProducts = tableData.length;
    const lowStockProducts = tableData.filter(item => item.isLowStock).length;
    const goodStockProducts = totalProducts - lowStockProducts;
    
    return {
      total: totalProducts,
      lowStock: lowStockProducts,
      goodStock: goodStockProducts
    };
  }, [tableData]);
  
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

  // Show loading spinner
  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularIndeterminate />
      </div>
    );
  }

//------------------------------------------- return -------------------------------------------
  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.stockPreview') || 'Stock Preview', href: '/stock-preview' }
      ]} isRtl={i18n.language === 'ar' || i18n.language === 'ARABIC'} />
      
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('stockPreview.title')}
        isRtl={i18n.language === 'ar' || i18n.language === 'ARABIC'}
        count={filteredData.length}
      />

      {/* ------------------------------------------- Stock Statistics ------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" dir={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'إجمالي المنتجات' : 'Total Products'}
              </p>
              <p className="text-2xl font-bold text-blue-800">{stockStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
             <Inventory2 className='text-blue-500' />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock'}
              </p>
              <p className="text-2xl font-bold text-green-800">{stockStats.goodStock}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className='text-green-500' />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock'}
              </p>
              <p className="text-2xl font-bold text-orange-800">{stockStats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <WarningAmber className='text-orange-500' />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- Filter Controls ------------------------------------------- */}
      <div className="mb-4 flex flex-wrap gap-3 items-center" dir={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}>
        <button
          onClick={() => setShowLowStockOnly(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showLowStockOnly 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'جميع المنتجات' : 'All Products'}
        </button>
        
        <button
          onClick={() => setShowLowStockOnly(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            showLowStockOnly 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span><WarningAmber className='text-red-500' /></span>
          {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض فقط' : 'Low Stock Only'}
          {stockStats.lowStock > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {stockStats.lowStock}
            </span>
          )}
        </button>
      </div>
      
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto">
        <CustomTable columns={columns as any} data={filteredData}  />
      </div>
      
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('stockPreview.deleteConfirmTitle') || 'Confirm Delete Product from Stock'}
        message={t('stockPreview.deleteConfirmMessage') || 'Are you sure you want to delete this product from stock?'}
        itemName={productToDelete ? productToDelete.name : ''}
        itemType={t('stockPreview.product') || 'product'}
        isRTL={i18n.language === 'ar' || i18n.language === 'ARABIC'}
        severity="danger"
      />
    </div>
  );
};

export default StockTable; 