import React, { useState } from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
 
import ProductSpecificationsDrawer from './ProductSpecificationsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';

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
      <HeaderWithAction
        title={t('products.productSpecifications') || 'Product Specifications'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleAdd}
        isRtl={i18n.language === 'ARABIC'}
        count={specs.length}
      />
      <div className="overflow-x-auto">
        <CustomTable columns={columns as any} data={specs} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      <ProductSpecificationsDrawer open={drawerOpen} onClose={handleDrawerClose} onSave={handleDrawerSave} spec={editingSpec} />
    </div>
  );
};

export default ProductSpecifications; 