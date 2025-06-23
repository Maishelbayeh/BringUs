// src/components/PaymentMethods/componant/PaymentDrawer.tsx
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PaymentForm from './paymentForm';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import PaymentIcon from '@mui/icons-material/Payment';
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
  if (!open) return null;
  const isRTL = language === 'ARABIC';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-primary/20 px-6 py-4`}>
          <div className="flex items-center gap-2">
          
            <span className="text-xl font-bold text-primary">
              {isEditMode ? t('paymentMethods.editPaymentMethod') : t('paymentMethods.addPaymentMethod')}
            </span>
          </div>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl"><CloseIcon fontSize="inherit" /></button>
        </div>
        {/* Form */}
        <div className="">
          <PaymentForm method={method} onSubmit={onSave} onCancel={onClose} language={language} isEditMode={isEditMode} />
        </div>
        {/* Footer */}
        <div className={`flex justify-between gap-2 px-6 py-4 border-t bg-white rounded-b-2xl `}>
          <CustomButton
            color="white"
            textColor="primary"
            text={t("paymentMethods.cancel")}
            action={onClose}
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={isEditMode ? t("paymentMethods.edit") : t("paymentMethods.save")}
            action={() => onSave(method!)}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
