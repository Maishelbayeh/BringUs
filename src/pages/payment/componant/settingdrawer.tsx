import React, { useRef, useState, useEffect } from 'react';
import PaymentForm, { PaymentFormRef } from './paymentForm';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';

interface Props {
  open: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
  onSave: (m: PaymentMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode: boolean;
}

const PaymentModal: React.FC<Props> = ({ open, onClose, method, onSave, language, isEditMode }) => {
  const { t } = useTranslation();
  const formRef = useRef<PaymentFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  
  useEffect(() => {
    if (open) {
      // Reset validation state when drawer opens
    }
  }, [open]);
  
  if (!open) return null;
  const isRTL = language === 'ARABIC';
  
  const handleSave = () => {
    if (formRef.current) {
      try {
        formRef.current.handleSubmit();
      } catch (error) {
        console.error('Error submitting payment form:', error);
      }
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div 
        className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col max-h-[90vh] ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {isEditMode ? t('paymentMethods.editPaymentMethod') : t('paymentMethods.addPaymentMethod')}
          </span>
          <button 
            onClick={onClose} 
            className="text-primary hover:text-red-500 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <PaymentForm 
            ref={formRef}
            method={method} 
            onSubmit={onSave} 
            onCancel={onClose} 
            language={language} 
            isEditMode={isEditMode}
            onValidationChange={handleValidationChange}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t("paymentMethods.cancel")}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={isEditMode ? t("paymentMethods.edit") : t("paymentMethods.save")}
            action={handleSave}
            disabled={!isFormValid}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
