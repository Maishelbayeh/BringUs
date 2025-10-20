import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import CircularIndeterminate from '../../components/common/loading/CircularIndeterminate';
import { CheckCircle, Inventory2, WarningAmber} from '@mui/icons-material';
import TableImage from '../../components/common/TableImage';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';

const StockTable: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  
  // Use hooks to get data
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  
  const columns = [
    { 
      key: 'image', 
      label: { ar: 'الصورة', en: 'Image' }, 
      type: 'custom',
      render: (_value: any, item: any) => {
        const mainImage = item.image || DEFAULT_PRODUCT_IMAGE;
        return (
          <div className="flex justify-center">
            <TableImage
              src={mainImage}
              alt={item.name}
              size="md"
            />
          </div>
        );
      }
    },
    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' },
    { 
      key: 'stockInfo', 
      label: { ar: 'المخزون والحالة', en: 'Stock & Status' }, 
      type: 'custom',
      render: (_value: any, row: any) => {
        console.log('row', row);
        const currentQuantity = row.availableQuantity;
        let quantityColorClass = 'bg-green-100 text-green-800';
        let statusColorClass = 'bg-green-100 text-green-800';
        let statusText = '';
        let quantityBadge = null;
        
        if (currentQuantity === 0) {
          quantityColorClass = 'bg-red-100 text-red-800';
          statusColorClass = 'bg-red-100 text-red-800';
          statusText = i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'منتهي' : 'Out of Stock';
          quantityBadge = (
            <span className="text-xs text-white bg-red-600 px-2 py-1 rounded ml-2">
              {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'منتهي' : 'Out of Stock'}
            </span>
          );
        } else if (row.isLowStock) {
          quantityColorClass = 'bg-yellow-100 text-yellow-800';
          statusColorClass = 'bg-yellow-100 text-yellow-800';
          statusText = i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock';
          // quantityBadge = (
            // <span className="text-xs text-yellow-800 bg-yellow-200 px-2 py-1 rounded ml-2">
            //   {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock'}
            // </span>
          // );
        } else {
          statusText = i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock';
        }

        return (
          <div className="flex items-center justify-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-2 justify-center">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${quantityColorClass}`}>
                {currentQuantity}
              </span>
              {quantityBadge}
            </div>
            
            {/* Status */}
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                {statusText}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'specifications',
      label: { ar: 'المواصفات', en: 'Specifications' },
      type: 'custom',
      render: (_value: any, row: any) => {
        const hasSpecifications = row.specificationValues && row.specificationValues.length > 0;
        
        if (!hasSpecifications) {
          return (
            <span className="text-gray-400 text-xs px-2 py-1 bg-gray-50 rounded">
              {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'لا توجد' : 'None'}
            </span>
          );
        }

        return (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={() => {
                setSelectedProduct(row);
                setShowSpecsModal(true);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center gap-2  hover:border-blue-300"
            >
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full font-bold">
                {row.specificationValues.length}
              </span>
              {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'عرض التفاصيل' : 'View Details'}
            </button>
          </div>
        );
      }
    },
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
  // const getCategoryName = (categoryId: string | number) => {
  //   if (!categories || categories.length === 0) return '-';
    
  //   const category = categories.find((c: any) => c._id === categoryId || c.id === categoryId);
  //   if (!category) return '-';
    
  //   return i18n.language === 'ar' || i18n.language === 'ARABIC' 
  //     ? category.nameAr || category.name
  //     : category.nameEn || category.name;
  // };

//------------------------------------------- getLabelName -------------------------------------------
  // const getLabelName = (labelId: number | string) => {
  //   const label = productLabelOptions.find((l: any) => l.id === labelId || l._id === labelId);
  //   return label ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? label.nameAr : label.nameEn) : '-';
  // };

//------------------------------------------- tableData -------------------------------------------
  const tableData = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map((product: any) => {
      const currentQuantity = product.availableQuantity || product.quantity || product.totalStock || 0;
      const lowStockThreshold = product.lowStockThreshold || 10; // Default threshold 10 if not set
      const isLowStock = currentQuantity <= lowStockThreshold;

      return {
        _id: product._id,
        image: product.mainImage || product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE,
        name: i18n.language === 'ar' || i18n.language === 'ARABIC' 
          ? product.nameAr || product.name
          : product.nameEn || product.name,
        availableQuantity: currentQuantity,
        isLowStock: isLowStock,
        stockStatus: isLowStock 
          ? (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock')
          : (i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock'),
        lowStockThreshold: lowStockThreshold,
        specificationValues: product.specificationValues || [],
        hasVariants: product.hasVariants || false,
        variantsCount: product.variantsCount || 0,
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
    const productsWithSpecs = tableData.filter(item => 
      item.specificationValues && item.specificationValues.length > 0
    ).length;
    
    return {
      total: totalProducts,
      lowStock: lowStockProducts,
      goodStock: goodStockProducts,
      productsWithSpecs: productsWithSpecs
    };
  }, [tableData]);
  
  //-------------------------------------------- handleDelete -------------------------------------------
  // const handleDelete = (product: any) => {
  //   setProductToDelete(product);
  //   setShowDeleteModal(true);
  // };
  
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
      <div className="mb-6">
        <div className="text-center mb-4">
          <h2 className={`text-xl font-bold text-gray-800 mb-2 ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
            {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'نظرة عامة على المخزون' : 'Stock Overview'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" dir={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`flex items-center justify-between ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}>
                <p className="text-blue-600 text-sm font-medium mb-1">
                  {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'إجمالي المنتجات' : 'Total Products'}
                </p>
                <p className="text-3xl font-bold text-blue-800">{stockStats.total}</p>
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center shadow-inner">
               <Inventory2 className='text-blue-600 text-xl' />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`flex items-center justify-between ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}>
                <p className="text-green-600 text-sm font-medium mb-1">
                  {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون جيد' : 'Good Stock'}
                </p>
                <p className="text-3xl font-bold text-green-800">{stockStats.goodStock}</p>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className='text-green-600 text-xl' />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`flex items-center justify-between ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}>
                <p className="text-orange-600 text-sm font-medium mb-1">
                  {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض' : 'Low Stock'}
                </p>
                <p className="text-3xl font-bold text-orange-800">{stockStats.lowStock}</p>
              </div>
              <div className="w-14 h-14 bg-orange-200 rounded-full flex items-center justify-center shadow-inner">
                <WarningAmber className='text-orange-600 text-xl' />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`flex items-center justify-between ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}>
                <p className="text-purple-600 text-sm font-medium mb-1">
                  {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'المنتجات مع المواصفات' : 'Products with Specs'}
                </p>
                <p className="text-3xl font-bold text-purple-800">{stockStats.productsWithSpecs}</p>
              </div>
              <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center shadow-inner">
                <Inventory2 className='text-purple-600 text-xl' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- Filter Controls ------------------------------------------- */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <h3 className={`text-lg font-semibold text-gray-700 mb-2 ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
            {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'فلترة المنتجات' : 'Filter Products'}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center justify-center" dir={i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'rtl' : 'ltr'}>
          <button
            onClick={() => setShowLowStockOnly(false)}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105
              ${!showLowStockOnly 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Inventory2 className="text-lg" />
              <span>{i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'جميع المنتجات' : 'All Products'}</span>
            </div>
          </button>
          
          <button
            onClick={() => setShowLowStockOnly(true)}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-3
              ${showLowStockOnly 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200' 
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              }
            `}
          >
            <WarningAmber className="text-lg" />
            <span>{i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'مخزون منخفض فقط' : 'Low Stock Only'}</span>
            {stockStats.lowStock > 0 && (
              <span className="bg-white text-red-600 text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                {stockStats.lowStock}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto">
        <CustomTable columns={columns as any} data={filteredData}  />
      </div>
      
      {/* Specifications Modal */}
      {showSpecsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`
            bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto
            ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}
          `}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
              <h3 className="text-lg font-semibold text-gray-800">
                {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'تفاصيل المواصفات' : 'Specification Details'}
              </h3>
              <button
                onClick={() => setShowSpecsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className={`flex items-center gap-3 ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                <img 
                  src={selectedProduct.image || DEFAULT_PRODUCT_IMAGE} 
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
                <div>
                  <h4 className="font-medium text-gray-800">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-500">
                    {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'إجمالي المخزون:' : 'Total Stock:'} 
                    <span className="font-semibold ml-1">{selectedProduct.availableQuantity}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications List */}
            <div className="p-4">
              <div className="space-y-3">
                {selectedProduct.specificationValues.map((spec: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className={`flex items-center justify-between mb-2 ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {i18n.language === 'ar' || i18n.language === 'ARABIC' ? spec.titleAr : spec.titleEn}
                      </span>
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-800">{i18n.language === 'ar' || i18n.language === 'ARABIC' ? spec.valueAr : spec.valueEn}</span>
                    </div>
                    
                    <div className={`
                      flex items-center gap-2
                      ${i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}
                    `}>
                      <span className={`
                        px-2 py-1 rounded text-xs font-bold min-w-[40px] text-center
                        ${spec.quantity === 0 
                          ? 'bg-red-100 text-red-700' 
                          : spec.quantity <= 2 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }
                      `}>
                        {spec.quantity}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'قطعة' : 'items'}
                      </span>
                      
                      {spec.quantity === 0 && (
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                          {i18n.language === 'ar' || i18n.language === 'ARABIC' ? 'منتهي' : 'Out'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  {i18n.language === 'ar' || i18n.language === 'ARABIC' 
                    ? `إجمالي المواصفات: ${selectedProduct.specificationValues.length}`
                    : `Total Specifications: ${selectedProduct.specificationValues.length}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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