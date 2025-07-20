// src/components/DeliveryAreas/DeliveryAreaForm.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DeliveryArea } from '../../../Types';

import CustomInput from '../../../components/common/CustomInput';
import { useTranslation } from 'react-i18next';
import { validateDeliveryForm } from '../validation/deliveryValidation';

interface Props {
  area: DeliveryArea | null;
  onSubmit: (area: DeliveryArea) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  locationAr?: string;
  locationEn?: string;
  price?: string;
  whatsappNumber?: string;
}

export interface FormRef {
  handleSubmit: () => void;
}

const DeliveryAreaForm = forwardRef<FormRef, Props>(({ area, onSubmit, onCancel, language, onValidationChange }, ref) => {
  const [locationAr, setLocationAr] = useState(area?.locationAr || '');
  const [locationEn, setLocationEn] = useState(area?.locationEn || '');
  const [price, setPrice] = useState(area?.price !== undefined ? area.price.toString() : '');
  const [whatsappNumber, setWhatsappNumber] = useState(area?.whatsappNumber || '');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { t } = useTranslation();

  useEffect(() => {
    setLocationAr(area?.locationAr || '');
    setLocationEn(area?.locationEn || '');
    setPrice(area?.price !== undefined ? area.price.toString() : '');
    setWhatsappNumber(area?.whatsappNumber || '');
    setErrors({});
  }, [area]);

  const validateForm = () => {
    const validationErrors = validateDeliveryForm({
      locationAr,
      locationEn,
      price,
      whatsappNumber
    }, t);

    setErrors(validationErrors);
    const isValid = Object.keys(validationErrors).length === 0;
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  const handleSubmit = () => {
    //CONSOLE.log('Form handleSubmit called');
    //CONSOLE.log('Form data:', { locationAr, locationEn, price, whatsappNumber });
    
    const isValid = validateForm();
    //CONSOLE.log('Form validation result:', isValid);
    
    if (isValid) {
      //CONSOLE.log('Form is valid, calling onSubmit');
      // Submit form
      onSubmit({
        id: area?.id || Date.now(),
        locationAr,
        locationEn,
        price: Number(price),
        whatsappNumber,
      });
    } else {
      //CONSOLE.log('Form is invalid, not submitting');
    }
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Expose handleSubmit to parent component
  useImperativeHandle(ref, () => ({
    handleSubmit
  }));

  return (
    <div className="flex flex-col p-4">
      <CustomInput
        label={t("deliveryDetails.locationAr")}
        id="location_ar"
        value={locationAr}
        onChange={e => {
          setLocationAr(e.target.value);
          clearError('locationAr');
        }}
        required
        placeholder={t("deliveryDetails.locationArPlaceholder")}
        type="text"
        style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
        error={errors.locationAr}
      />
      
      <CustomInput
        label={t("deliveryDetails.locationEn")}
        id="location_en"
        value={locationEn}
        onChange={e => {
          setLocationEn(e.target.value);
          clearError('locationEn');
        }}
        required
        placeholder={t("deliveryDetails.locationEnPlaceholder")}
        type="text"
        style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
        error={errors.locationEn}
      />
      
      <CustomInput
        label={t("deliveryDetails.price")}
        id="price"
        value={price}
        onChange={e => {
          setPrice(e.target.value);
          clearError('price');
        }}
        required
        placeholder={t("deliveryDetails.pricePlaceholder")}
        type="number"
        min="0"
        style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
        error={errors.price}
      />
      
      <CustomInput
        label={t("deliveryDetails.whatsappNumber")}
        id="whatsapp"
        value={whatsappNumber}
        onChange={e => {
          setWhatsappNumber(e.target.value);
          clearError('whatsappNumber');
        }}
        required
        placeholder={t("deliveryDetails.whatsappNumberPlaceholder")}
        type="text"
        style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
        error={errors.whatsappNumber}
      />
    </div>
  );
});

DeliveryAreaForm.displayName = 'DeliveryAreaForm';

export default DeliveryAreaForm;