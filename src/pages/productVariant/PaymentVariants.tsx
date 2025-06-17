import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/outline';
import CustomTable from '../../components/common/CustomTable';
import PaymentVariantsDrawer from './PaymentVariantsDrawer';
import { useNavigate } from 'react-router-dom';

interface PaymentVariant {
  id: number;
  productId: number;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  key: string;
  label: {
    en: string;
    ar: string;
  };
  type: 'text' | 'number' | 'date';
  align: 'left' | 'right' | 'center';
}

const PaymentVariants: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PaymentVariant | undefined>();
  const [variants, setVariants] = useState<PaymentVariant[]>([
    {
      id: 1,
      productId: 1,
      name: 'Variant 1',
      price: 100,
      createdAt: '2024-03-20T10:00:00',
      updatedAt: '2024-03-20T10:00:00'
    },
    // Add more sample data as needed
  ]);

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null, path: '/' },
    { name: t('productVariant.title') || 'Payment Variants', id: 1, path: '/product-variants' }
  ];

  const columns: Column[] = [
    {
      key: 'id',
      label: {
        en: 'ID',
        ar: 'رقم المنتج'
      },
      type: 'number',
      align: 'center'
    },
    {
      key: 'name',
      label: {
        en: 'Name',
        ar: 'الاسم'
      },
      type: 'text',
      align: i18n.language === 'ar' ? 'right' : 'left'
    },
    {
      key: 'price',
      label: {
        en: 'Price',
        ar: 'السعر'
      },
      type: 'number',
      align: 'center'
    },
    {
      key: 'createdAt',
      label: {
        en: 'Created At',
        ar: 'تاريخ الإنشاء'
      },
      type: 'date',
      align: 'center'
    },
    {
      key: 'updatedAt',
      label: {
        en: 'Updated At',
        ar: 'تاريخ التحديث'
      },
      type: 'date',
      align: 'center'
    }
  ];

  const handleEdit = (variant: PaymentVariant) => {
    setSelectedVariant(variant);
    setIsDrawerOpen(true);
  };

  const handleDelete = (variant: PaymentVariant) => {
    // Implement delete functionality
    setVariants(prev => prev.filter(v => v.id !== variant.id));
  };

  const handleSubmit = (variant: Omit<PaymentVariant, 'createdAt' | 'updatedAt'>) => {
    if (selectedVariant) {
      // Update existing variant
      setVariants(prev => prev.map(v => v.id === variant.id ? { ...variant, createdAt: v.createdAt, updatedAt: new Date().toISOString() } : v));
    } else {
      // Add new variant
      const newVariant: PaymentVariant = {
        ...variant,
        id: Math.max(...variants.map(v => v.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setVariants(prev => [...prev, newVariant]);
    }
    setIsDrawerOpen(false);
    setSelectedVariant(undefined);
  };

  return (
    <div className="p-6 w-full">
      {/* Breadcrumb */}
      <nav className={`flex items-center text-gray-500 text-sm mb-4 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`} aria-label="Breadcrumb">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={item.id}>
            <span className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`} onClick={() => navigate(item.path)}>{item.name}</span>
            {idx < breadcrumb.length - 1 && <ChevronRightIcon className={`h-4 w-4 mx-2 ${i18n.language === 'ARABIC' ? 'rotate-180' : ''}`} />}
          </React.Fragment>
        ))}
      </nav>
      <div className={`flex justify-between items-center mb-6 ${i18n.language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('productVariant.title')}
        </h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('productVariant.addProductVariant')}
        </button>
      </div>

      <CustomTable
        columns={columns}
        data={variants}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PaymentVariantsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVariant(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedVariant}
        products={[
          { id: 1, name: { en: 'Product 1', ar: 'المنتج 1' } },
          { id: 2, name: { en: 'Product 2', ar: 'المنتج 2' } }
        ]}
                isRTL={i18n.language === 'ARABIC'}
      />
    </div>
  );
};

export default PaymentVariants; 