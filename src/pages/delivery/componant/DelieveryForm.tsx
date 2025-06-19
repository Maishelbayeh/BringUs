// src/components/DeliveryAreas/DeliveryAreaForm.tsx
import React, { useState, useEffect } from 'react';
import { Box} from '@mui/material';
import { DeliveryArea } from '../../../Types';

import CustomInput from '../../../components/common/CustomInput';
import { useTranslation } from 'react-i18next';

interface Props {
  area: DeliveryArea | null;
  onSubmit: (area: DeliveryArea) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
}

const DeliveryAreaForm: React.FC<Props> = ({ area, onSubmit, onCancel, language }) => {
  const [locationAr, setLocationAr] = useState(area?.locationAr || '');
  const [locationEn, setLocationEn] = useState(area?.locationEn || '');
  const [price, setPrice] = useState(area?.price !== undefined ? area.price.toString() : '');
  const [whatsappNumber, setWhatsappNumber] = useState(area?.whatsappNumber || '');
  const { t } = useTranslation();
  useEffect(() => {
    setLocationAr(area?.locationAr || '');
    setLocationEn(area?.locationEn || '');
    setPrice(area?.price !== undefined ? area.price.toString() : '');
    setWhatsappNumber(area?.whatsappNumber || '');
  }, [area]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationAr || !locationEn || !price || !whatsappNumber) return;
    onSubmit({
      id: area?.id || Date.now(),
      locationAr,
      locationEn,
      price: Number(price),
      whatsappNumber,
    });
  };

  return (
   
      <form onSubmit={handleSubmit} className="flex flex-col  p-4">
      
   
        
        <CustomInput
          label={t("deliveryDetails.locationAr")}
          id="location_ar"
          value={locationAr}
          onChange={e => setLocationAr(e.target.value)}
          required
          placeholder={t("deliveryDetails.locationArPlaceholder")}
          type="text"
          style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          labelAlign={language === 'ARABIC' ? 'right' : 'left'}
        />
        <CustomInput
          label={t("deliveryDetails.locationEn")}
          id="location_en"
          value={locationEn}
          onChange={e => setLocationEn(e.target.value)}
          required
          placeholder={t("deliveryDetails.locationEnPlaceholder")}
          type="text"
          style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          labelAlign={language === 'ARABIC' ? 'right' : 'left'}
        />
        <CustomInput
          label={t("deliveryDetails.price")}
          id="price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          placeholder={t("deliveryDetails.pricePlaceholder")}
          type="number"
          min="0"
          style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          labelAlign={language === 'ARABIC' ? 'right' : 'left'}
        />
        <CustomInput
          label={t("deliveryDetails.whatsappNumber")}
          id="whatsapp"
          value={whatsappNumber}
          onChange={e => setWhatsappNumber(e.target.value)}
          required
          placeholder={t("deliveryDetails.whatsappNumberPlaceholder")}
          type="text"
          style={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          labelAlign={language === 'ARABIC' ? 'right' : 'left'}
        />

       
        </form>
   
  );
};

export default DeliveryAreaForm;