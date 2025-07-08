import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomNumberInput from '../../components/common/CustomNumberInput';
import CustomButton from '../../components/common/CustomButton';
import { validateProductVariantForm } from './productVariantValidation';
import useProductVariants from '@/hooks/useProductVariants';

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
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  productId?: string;
  name?: string;
  price?: string;
}

export interface PaymentVariantsDrawerRef {
  handleSubmit: () => void;
}

const PaymentVariantsDrawer = forwardRef<PaymentVariantsDrawerRef, PaymentVariantsDrawerProps>(({
  isOpen,
  onClose,
  onSubmit,
  products,
  initialData,
  isRTL = false,
  onValidationChange
}, ref) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<Omit<PaymentVariant, 'createdAt' | 'updatedAt'>>(
    initialData || {
      id: 0,
      productId: 0,
      name: '',
      price: 0
    }
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Expose handleSubmit function to parent
  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      console.log('PaymentVariantsDrawer handleSubmit called');
      if (validateForm()) {
        console.log('PaymentVariantsDrawer validation passed, submitting...');
        onSubmit(formData);
      } else {
        console.log('PaymentVariantsDrawer validation failed');
      }
    }
  }));

  // Reset form when drawer opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        id: 0,
        productId: 0,
        name: '',
        price: 0
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = validateForm();
    console.log('PaymentVariantsDrawer useEffect - validation result:', isValid);
  }, [formData]);

  // Initial validation when component mounts or initialData changes
  useEffect(() => {
    console.log('PaymentVariantsDrawer initial validation');
    const isValid = validateForm();
    
    // For edit mode, if we have initialData, the form should be valid by default
    if (initialData) {
      console.log('Edit mode with initialData - setting form as valid');
      if (onValidationChange) {
        onValidationChange(true);
      }
    } else {
      console.log('New mode or no initialData - validation result:', isValid);
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }
  }, [initialData, onValidationChange]);

  const validateForm = (): boolean => {
    const validationData = {
      productId: formData.productId,
      name: formData.name,
      price: formData.price
    };

    const validationErrors = validateProductVariantForm(validationData, t, !!initialData);
    setErrors(validationErrors);
    
    const isValid = Object.keys(validationErrors).length === 0;
    
    console.log('PaymentVariantsDrawer validation result:', isValid, validationErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    clearError(field as keyof ValidationErrors);
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
        <div className="flex flex-col p-4">
          <CustomSelect
            label={t('productVariant.product')}
            value={formData.productId.toString()}
            onChange={(e) => handleInputChange('productId', Number(e.target.value))}
            options={[
              { value: '', label: t('productVariant.selectProduct') },
              ...products.map(product => ({
                value: product.id.toString(),
                label: product.name[i18n.language as 'en' | 'ar']
              }))
            ]}
            error={errors.productId}
          />
          
          <CustomInput
            label={t('productVariant.name')}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('productVariant.namePlaceholder')}
            error={errors.name}
            required
          />
          
          <CustomNumberInput
            label={t('productVariant.price')}
            value={formData.price}
            onChange={(value: number) => handleInputChange('price', value)}
            placeholder="0"
            min={0}
            step={0.01}
            error={errors.price}
            required
          />
        </div>
        
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
            onClick={() => {
              if (validateForm()) {
                onSubmit(formData);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
});

PaymentVariantsDrawer.displayName = 'PaymentVariantsDrawer';

export default PaymentVariantsDrawer; 