// src/components/DeliveryAreas/DeliveryAreaForm.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DeliveryArea } from '../../../Types';

import CustomInput from '../../../components/common/CustomInput';
import { useTranslation } from 'react-i18next';
import { useValidation } from '../../../hooks/useValidation';
import { deliveryValidationSchema, DeliveryFormData } from '../../../validation/deliveryValidation';

interface Props {
  area: DeliveryArea | null;
  onSubmit: (area: DeliveryArea) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  onValidationChange?: (isValid: boolean) => void;
}

export interface FormRef {
  handleSubmit: () => void;
}

const DeliveryAreaForm = forwardRef<FormRef, Props>(({ area, onSubmit, onCancel, language, onValidationChange }, ref) => {
  const [locationAr, setLocationAr] = useState(area?.locationAr || '');
  const [locationEn, setLocationEn] = useState(area?.locationEn || '');
  const [price, setPrice] = useState(area?.price !== undefined ? area.price.toString() : '');
  const [whatsappNumber, setWhatsappNumber] = useState(area?.whatsappNumber || '');
  const { t } = useTranslation();

  // استخدام النظام الجديد للفالديشين
  const {
    errors,
    validateForm: validateFormData,
    validateWhatsApp,
    clearError,
  } = useValidation({
    schema: deliveryValidationSchema,
    onValidationChange,
  });

  useEffect(() => {
    setLocationAr(area?.locationAr || '');
    setLocationEn(area?.locationEn || '');
    setPrice(area?.price !== undefined ? area.price.toString() : '');
    setWhatsappNumber(area?.whatsappNumber || '');
    // مسح الأخطاء عند تحديث البيانات
    // clearAllErrors(); // سيتم مسح الأخطاء تلقائياً مع التحديث
  }, [area]);

  const validateForm = () => {
    const formData: DeliveryFormData = {
      locationAr,
      locationEn,
      price,
      whatsappNumber
    };

    const result = validateFormData(formData);
    
    // التحقق من رقم الواتساب منفصلاً
    const whatsappError = validateWhatsApp(whatsappNumber);
    if (whatsappError) {
      // إضافة خطأ الواتساب إلى النتيجة
      result.errors.whatsappNumber = whatsappError;
      result.isValid = false;
    }
    
    return result.isValid;
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

  // دالة مسح الخطأ (تم استبدالها بـ clearError من الـ hook)
  const clearFieldError = (field: string) => {
    clearError(field);
  };

  // Expose handleSubmit to parent component
  useImperativeHandle(ref, () => ({
    handleSubmit
  }));

  return (
    <div className="flex flex-col p-4 gap-4">
      <CustomInput
        label={t("deliveryDetails.locationAr")}
        id="location_ar"
        value={locationAr}
        onChange={e => {
          setLocationAr(e.target.value);
          clearFieldError('locationAr');
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
          clearFieldError('locationEn');
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
          clearFieldError('price');
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
          clearFieldError('whatsappNumber');
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