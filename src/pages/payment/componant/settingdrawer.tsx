import React, { useRef, useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
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
  const [isFormValid, setIsFormValid] = useState(false); // Start as false to require validation
  
  // Reset validation state when modal opens
  useEffect(() => {
    if (open) {
      // Don't reset to true, let the form validate itself
      console.log('Payment modal opened');
    }
  }, [open]);
  
  if (!open) return null;
  const isRTL = language === 'ARABIC';
  
  const handleSave = () => {
    console.log('Payment drawer save clicked, form valid:', isFormValid);
    console.log('Form ref exists:', !!formRef.current);
    
    if (formRef.current) {
      console.log('Calling payment form handleSubmit');
      try {
        formRef.current.handleSubmit();
      } catch (error) {
        console.error('Error submitting payment form:', error);
      }
    } else {
      console.log('Payment form ref is null');
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    console.log('Payment validation changed:', isValid);
    setIsFormValid(isValid);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto relative flex flex-col max-h-[90vh] ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Fixed Header */}
        <div className={`flex items-center justify-between border-b border-primary/20 px-6 py-4 bg-white rounded-t-2xl flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {isEditMode ? t('paymentMethods.editPaymentMethod') : t('paymentMethods.addPaymentMethod')}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-primary hover:text-red-500 text-2xl transition-colors"
            type="button"
          >
            <CloseIcon fontSize="inherit" />
          </button>
        </div>

        {/* Scrollable Form Content */}
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

        {/* Fixed Footer */}
        <div className={`flex justify-between gap-2 px-6 py-4 border-t bg-white rounded-b-2xl flex-shrink-0`}>
          <CustomButton
            color="white"
            textColor="primary"
            text={t("paymentMethods.cancel")}
            action={onClose}
          />
          <div className="flex flex-col items-end">
            <CustomButton
              color="primary"
              textColor="white"
              text={isEditMode ? t("paymentMethods.edit") : t("paymentMethods.save")}
              action={handleSave}
              disabled={!isFormValid}
            />
            {!isFormValid && (
              <p className="text-xs text-gray-500 mt-1">
                {t('common.pleaseCompleteForm', 'Please complete all required fields')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
