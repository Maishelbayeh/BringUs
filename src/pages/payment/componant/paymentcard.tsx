// src/components/PaymentMethods/componant/PaymentCard.tsx
import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../../components/common/CustomButton';

interface Props {
  method: PaymentMethod;
  onEdit: (m: PaymentMethod) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  onClick: (m: PaymentMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
}

const PaymentCard: React.FC<Props> = ({ method, onEdit, onDelete, onSetDefault, onClick, language }) => {
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
      onClick={() => onClick(method)}
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
        <Box sx={{ display: 'flex', gap: 2, flexDirection: language === 'ARABIC' ? 'row-reverse' : 'row', alignItems: { xs: 'center', sm: 'flex-start' }, mb: { xs: 2, sm: 0 } }}>
          {method.logoUrl ? (
            <Avatar src={method.logoUrl} sx={{ mb: 1 }} variant="square" />
          ) : (
            <Avatar sx={{ mb: 1, backgroundColor: 'rgb(99 76 159 / var(--tw-bg-opacity, 1))' }} className='bg-primary text-white'>
              {method.title.charAt(0)}
            </Avatar>
          )}
          <Typography variant="h6" className='text-primary'>{language === 'ARABIC' ? method.titleAr : method.titleEn}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-end' }, gap: 1 }}>
          {!method.isDefault && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CustomButton
                color="#fff"
                textColor="#1976d2"
                text={t('paymentMethods.edit')}
                icon={<EditIcon fontSize="small" />}
                action={() => onEdit(method)}
                style={{ border: '1.5px solid #1976d2', padding: '2px 10px', fontSize: 12 }}
              />
              <CustomButton
                color="#fff"
                textColor="#d32f2f"
                text={t('paymentMethods.delete')}
                icon={<DeleteIcon fontSize="small" />}
                style={{ border: '1.5px solid #d32f2f', padding: '2px 10px', fontSize: 12 }}
              />
              <CustomButton
                color="#1976d2"
                textColor="#fff"
                text={t('paymentMethods.setDefault')}
                style={{ padding: '2px 10px', fontSize: 12 }}
              />
            </Box>
          )}
          {method.isDefault && (
            <Box display="flex" alignItems="center">
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="caption" color="text.secondary" ml={0.5}>
                {t('paymentMethods.default')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
