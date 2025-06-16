// src/components/DeliveryAreas/DeliveryAreaCard.tsx
import React from 'react';
import { Card, CardContent, Typography,  Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { DeliveryArea } from '../../../Types';
import CustomButton from '../../../components/common/CustomButton';
import { useTranslation } from 'react-i18next';

interface Props {
  area: DeliveryArea;
  onManage: (area: DeliveryArea) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
  language: 'ENGLISH' | 'ARABIC';
}

const DeliveryAreaCard: React.FC<Props> = ({ area, onManage, language }) => {
  const { t } = useTranslation();
  return (
  <Card
    className='border-primary border-2'
    sx={{
      mb: 2,
      borderRadius: 3,
   
      background: '#fff',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.13)',
        transform: 'scale(1.02)',
      },
    }}
  >
    <CardContent
      className='bg-primary-light'
      sx={{
        display: 'flex',
        flexDirection: language === 'ARABIC' ? { xs: 'column', sm: 'row-reverse' } : { xs: 'column', sm: 'row' },
        justifyContent: { xs: 'center', sm: 'space-between' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        px: 3,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' }, mb: { xs: 2, sm: 0 } }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} className='text-primary' >
          {language === 'ARABIC' ? (area.locationAr || area.location) : (area.locationEn || area.location)}
        </Typography>
        <Typography variant="body2" className='text-body' >
          {area.whatsappNumber}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: { xs: 'center', sm: 'right' }, mb: { xs: 2, sm: 0 } }} className='text-primary'>
        {area.price} ILS
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
        <CustomButton
          color="primary"
          text={t('deliveryDetails.manage')}
          alignment="center"
          action={() => onManage(area)}
          icon={<SettingsIcon />}
          textColor="white"
        />
      </Box>
    </CardContent>
  </Card>
)};

export default DeliveryAreaCard;


