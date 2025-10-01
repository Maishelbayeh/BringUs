import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import ProductSpecificationsDrawer from './ProductSpecificationsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import PermissionModal from '../../components/common/PermissionModal';
import { useStoreUrls } from '@/hooks/useStoreUrls';

const ProductSpecifications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<any>(null);
  const [search, setSearch] = useState('');
  const { storeSlug } = useStoreUrls();
  const {
    specifications,
    loading,
    fetchSpecifications,
    deleteSpecification,
  } = useProductSpecifications();

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  // فلترة المواصفات حسب البحث
  const filteredSpecifications = specifications.filter(spec => {
    const searchTerm = search.toLowerCase();
    const titleAr = spec.titleAr?.toLowerCase() || '';
    const titleEn = spec.titleEn?.toLowerCase() || '';
    const categoryName = spec.category?.nameAr?.toLowerCase() || spec.category?.nameEn?.toLowerCase() || '';
    
    return titleAr.includes(searchTerm) || 
           titleEn.includes(searchTerm) || 
           categoryName.includes(searchTerm);
  });

  const handleDelete = async (item: any) => {
    try {
      setSpecToDelete(item);
      setShowDeleteModal(true);
    } catch (error) {
      console.error('Error deleting specification:', error);
    }
  };

  const handleEdit = (spec: any) => {
    setEditingSpec(spec);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingSpec(null);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingSpec(null);
  };

  const handleSaveSuccess = () => {
    setDrawerOpen(false);
    setEditingSpec(null);
    fetchSpecifications(true); // Re-fetch data after saving
  };

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
    { name: t('sideBar.productSpecifications') || 'Product Specifications', href: `/${storeSlug}/specifications` },
  ];

  return (
    <div className="sm:p-4 w-full">
      {/* Breadcrumb */}
      <CustomBreadcrumb items={breadcrumb} isRtl={isRTL} />
      
      <HeaderWithAction
        title={t('sideBar.productSpecifications') || 'Product Specifications'}
        addLabel={t('common.add') || 'Add Specification'}
        onAdd={handleAdd}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        count={filteredSpecifications.length}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('products.searchSpecifications') || 'Search specifications...'}
      />

      {/* Loading State */}
      {loading ? (
        <div 
          className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
         style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }}
        >
    
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
            >
              {/* Header Skeleton */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  </div>
                </div>
                
                {/* Badges Skeleton */}
                <div className="flex items-center gap-1">
                  <div className="h-5 bg-gray-300 rounded w-16"></div>
                  <div className="h-5 bg-gray-300 rounded w-12"></div>
                  <div className="h-5 bg-gray-300 rounded w-6"></div>
                </div>
              </div>

              {/* Values Skeleton */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 bg-gray-300 rounded w-10"></div>
                  <div className="h-4 bg-gray-300 rounded w-6"></div>
                </div>
                
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                      <div className="h-3 bg-gray-300 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }}
        >
          {filteredSpecifications.map((spec) => (
            <div
              key={spec._id}
              className="group bg-white rounded-lg border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => handleEdit(spec)}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {isRTL ? spec.titleAr : spec.titleEn}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {isRTL ? spec.titleEn : spec.titleAr}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="bg-primary/90 hover:bg-primary text-white rounded-full p-1.5 shadow hover:scale-110 transition-transform duration-200"
                      onClick={e => { e.stopPropagation(); handleEdit(spec); }}
                      title={t('common.edit')}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow hover:scale-110 transition-transform duration-200"
                      onClick={e => { e.stopPropagation(); handleDelete(spec); }}
                      title={t('common.delete')}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  {spec.category && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {isRTL ? spec.category.nameAr : spec.category.nameEn}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    spec.isActive 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {spec.isActive ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'غير مفعل' : 'Inactive')}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                    #{spec.sortOrder}
                  </span>
                </div>
              </div>

              {/* Values */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">
                    {isRTL ? 'القيم' : 'Values'}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {spec.values?.length || 0}
                  </span>
                </div>

                <div className="space-y-1">
                  {spec.values?.slice(0, 3).map((value: any, index: number) => (
                    <div key={value._id || index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="text-xs text-gray-800 font-medium truncate flex-1">
                        {isRTL ? value.valueAr : value.valueEn}
                      </span>
                      <span className="text-xs text-gray-500 ml-1 truncate max-w-16">
                        {isRTL ? value.valueEn : value.valueAr}
                      </span>
                    </div>
                  ))}
                  
                  {spec.values?.length > 3 && (
                    <div className="text-center pt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {isRTL ? `+ ${spec.values.length - 3} أكثر` : `+ ${spec.values.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSpecifications.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isRTL ? 'لا توجد مواصفات منتجات' : 'No Product Specifications'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isRTL ? 'ابدأ بإضافة مواصفات المنتجات لتنظيم منتجاتك بشكل أفضل' : 'Start by adding product specifications to better organize your products'}
          </p>
        </div>
      )}
      
      <ProductSpecificationsDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        onSaveSuccess={handleSaveSuccess} 
        spec={editingSpec}
      />

      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (specToDelete) {
            try {
              await deleteSpecification();
              setShowDeleteModal(false);
              setSpecToDelete(null);
            } catch (error) {
              console.error('Error deleting specification:', error);
            }
          }
        }}
        title={t('products.deleteSpecConfirmTitle') || 'Confirm Delete Specification'}
        message={t('products.deleteSpecConfirmMessage') || 'Are you sure you want to delete this specification?'}
        itemName={specToDelete ? (isRTL ? specToDelete.titleAr : specToDelete.titleEn) : ''}
        itemType={t('products.specification') || 'specification'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default ProductSpecifications; 