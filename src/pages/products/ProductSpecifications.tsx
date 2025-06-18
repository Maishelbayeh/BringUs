import React, { useState } from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProductSpecificationsDrawer from './ProductSpecificationsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';

const initialSpecs = [
  { id: 1, description: 'طويل' },
  { id: 2, description: 'قصير' },
  { id: 3, description: 'كبير' },
  { id: 4, description: 'وسط' },
  { id: 5, description: 'صغير' },
  { id: 6, description: 'نمرة 40' },
  { id: 7, description: 'نمرة 42' },
  { id: 8, description: 'نمرة 44' },
  { id: 9, description: 'عريض' },
  { id: 10, description: 'ضيق' },
];

const ProductSpecifications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [specs, setSpecs] = useState(initialSpecs);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);

  const handleDelete = (item: any) => {
    setSpecs(prev => prev.filter(s => s.id !== item.id));
  };
  const handleEdit = (item: any) => {
    setEditingSpec(item);
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
  const handleDrawerSave = (spec: any) => {
    if (spec.id) {
      setSpecs(prev => prev.map(s => (s.id === spec.id ? spec : s)));
    } else {
      setSpecs(prev => [...prev, { ...spec, id: Date.now() }]);
    }
    setDrawerOpen(false);
    setEditingSpec(null);
  };

  const columns = [
    { key: 'description', label: { ar: 'وصف الصفة', en: 'Specification Description' }, type: 'text', align: 'center' },
  ];

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.products') || 'Products', href: '/products' },
    { name: t('products.productSpecifications') || 'Product Specifications', href: '/products/specifications' },
  ];

  return (
    <div className="p-6 w-full">
      {/* Breadcrumb */}
      <CustomBreadcrumb items={breadcrumb} isRtl={i18n.language === 'ARABIC'} />
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
        <h1 className="text-2xl font-bold text-primary">{t('products.productSpecifications') || 'Product Specifications'}</h1>
        <button
          onClick={handleAdd}
          className={`flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {i18n.language === 'ARABIC' ? (
            <>
              <span>{t('common.add') || 'Add'}</span>
              <PlusIcon className="h-5 w-5" />
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5" />
              <span>{t('common.add') || 'Add'}</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <CustomTable columns={columns as any} data={specs} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      <ProductSpecificationsDrawer open={drawerOpen} onClose={handleDrawerClose} onSave={handleDrawerSave} spec={editingSpec} />
    </div>
  );
};

export default ProductSpecifications; 