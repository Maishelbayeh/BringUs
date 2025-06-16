import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XIcon } from '@heroicons/react/outline';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomNumberInput from '../../components/common/CustomNumberInput';

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} w-full max-w-md bg-white shadow-xl`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {initialData ? t('payment.variants.edit') : t('payment.variants.add')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <CustomSelect
                label={t('payment.variants.product')}
                value={formData.productId.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: Number(e.target.value) }))}
                options={products.map(product => ({
                  value: product.id.toString(),
                  label: product.name[i18n.language as 'en' | 'ar']
                }))}
                isRTL={isRTL}
              />

              <CustomInput
                label={t('payment.variants.name')}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                labelAlign={isRTL ? 'right' : 'left'}
              />

              <CustomNumberInput
                label={t('payment.variants.price')}
                value={formData.price}
                onChange={(value: number) => setFormData(prev => ({ ...prev, price: value }))}
                labelAlign={isRTL ? 'right' : 'left'}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVariantsDrawer; 