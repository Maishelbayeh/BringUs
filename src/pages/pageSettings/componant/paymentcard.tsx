// src/components/PaymentMethods/componant/PaymentCard.tsx
import React from 'react';
import { Card, CardContent, Typography, IconButton, Button, Box, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';

interface Props {
  method: PaymentMethod;
  onEdit: (m: PaymentMethod) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  onClick: (m: PaymentMethod) => void;
}

const PaymentCard: React.FC<Props> = ({ method, onEdit, onDelete, onSetDefault, onClick }) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        mb: 3,
        borderLeft: method.isDefault ? '4px solid #4caf50' : '4px solid #3f51b5',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { cursor: 'pointer', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)' },
      }}
      onClick={() => onClick(method)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {method.logoUrl ? (
              <Avatar src={method.logoUrl} sx={{ mr: 2 }} variant="square" />
            ) : (
              <Avatar sx={{ mr: 2, bgcolor: '#e0e0e0' }}>
                {method.title.charAt(0)}
              </Avatar>
            )}
            <Typography variant="h6">{t(method.title)}</Typography>
          </Box>
          <Box>
            {!method.isDefault && (
              <>
                <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(method); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(method.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button size="small" onClick={e => { e.stopPropagation(); onSetDefault(method.id); }} sx={{ ml: 1 }}>
                  {t('Set as default')}
                </Button>
              </>
            )}
            {method.isDefault && (
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary" ml={0.5}>
                  {t('Default')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
