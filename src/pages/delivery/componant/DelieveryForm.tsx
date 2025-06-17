// src/components/DeliveryAreas/DeliveryAreaForm.tsx
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { DeliveryArea } from '../../../Types';

import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
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
    // <Paper 
    //   elevation={3}
    //   sx={{ 
    //     p: 4,
    //     borderRadius: 4,
    //     background: theme.palette.mode === 'dark' 
    //       ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)' 
    //       : 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
    //     // boxShadow: theme.shadows[10],
    //   }}
    // >
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          p: 3,
          borderRadius: 3,
        }}
      >
   
        
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

        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: language === 'ARABIC' ? 'row-reverse' : 'row',
            justifyContent:  'flex-start',
            gap: 2,
            mt: 4,
          }}
        >
         
        
        </Box>
      </Box>
    // </Paper>
  );
};

export default DeliveryAreaForm;