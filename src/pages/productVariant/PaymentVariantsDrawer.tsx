import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomNumberInput from '../../components/common/CustomNumberInput';
import CustomButton from '../../components/common/CustomButton';

interface PaymentVariant {
  id: number;
  productId: number;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentVariantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (variant: Omit<PaymentVariant, 'createdAt' | 'updatedAt'>) => void;
  products: Array<{ id: number; name: { en: string; ar: string } }>;
  initialData?: PaymentVariant;
  isRTL?: boolean;
}

const PaymentVariantsDrawer: React.FC<PaymentVariantsDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  initialData,
  isRTL = false
}) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<Omit<PaymentVariant, 'createdAt' | 'updatedAt'>>(
    initialData || {
      id: 0,
      productId: 0,
      name: '',
      price: 0
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {initialData ? t('productVariant.editProductVariant') : t('productVariant.addProductVariant')}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col p-4">
          <CustomSelect
            label={t('productVariant.product')}
            value={formData.productId.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, productId: Number(e.target.value) }))}
            options={[
              { value: '', label: t('productVariant.selectProduct') },
              ...products.map(product => ({
                value: product.id.toString(),
                label: product.name[i18n.language as 'en' | 'ar']
              }))
            ]}
          />
          <CustomInput
            label={t('productVariant.name')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <CustomNumberInput
            label={t('productVariant.price')}
            value={formData.price}
            onChange={(value: number) => setFormData(prev => ({ ...prev, price: value }))}
            labelAlign={isRTL ? 'right' : 'left'}
          />
        </form>
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel')}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save')}
            type="submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentVariantsDrawer; 