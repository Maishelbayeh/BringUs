// src/components/DeliveryAreas/DeliveryAreaDrawer.tsx
import React, { useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeliveryAreaForm, { FormRef } from './DelieveryForm';
import { DelieveryMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/common/CustomButton';

interface Props {
  open: boolean;
  onClose: () => void;
  area: DelieveryMethod | null;
  onSave: (area: DelieveryMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode: boolean;
  loading?: boolean;
}

const DeliveryAreaModal: React.FC<Props> = ({ open, onClose, area, onSave, language, isEditMode }) => {
  const { t } = useTranslation();
  const formRef = useRef<FormRef>(null);
  const [_isFormValid, setIsFormValid] = useState(true); // Start as true to allow submission

  if (!open) return null;
  
  const isRTL = language === 'ARABIC';

  const handleDrawerSubmit = () => {
    //CONSOLE.log('Drawer submit clicked');
    if (formRef.current) {
      //CONSOLE.log('Calling form handleSubmit');
      formRef.current.handleSubmit();
    } else {
      //CONSOLE.log('Form ref is null');
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    //CONSOLE.log('Validation changed:', isValid);
    setIsFormValid(isValid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-primary/20 px-6 py-4`}>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {isEditMode ? t('deliveryDetails.editDeliveryArea') : t('deliveryDetails.addNewDeliveryArea')}
            </span>
          </div>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">
            <CloseIcon fontSize="inherit" />
          </button>
        </div>
        
        {/* Form */}
        <div className="flex-1">
          <DeliveryAreaForm 
            ref={formRef}
            area={area} 
            onSubmit={onSave} 
            onCancel={onClose} 
            language={language}
            onValidationChange={handleValidationChange}
          />
        </div>
        
        {/* Footer */}
        <div className={`flex justify-between gap-2 px-6 py-4 border-t bg-white rounded-b-2xl flex-row-reverse`}>
          <CustomButton
            color="primary"
            textColor="white"
            text={area ? t("deliveryDetails.updateArea") : t("deliveryDetails.createArea")}
            action={handleDrawerSubmit}
            disabled={false} // Temporarily disable validation to test
          />
          <CustomButton
            color="white"
            textColor="primary"
            text={t("deliveryDetails.cancel")}
            action={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryAreaModal;