// src/components/DeliveryAreas/DeliveryAreaCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { DeliveryArea } from '../../../Types';

interface Props {
  area: DeliveryArea;
  onManage: (area: DeliveryArea) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const DeliveryAreaCard: React.FC<Props> = ({ area, onManage }) => (
  <Card
    sx={{
      mb: 2,
      borderRadius: 2,
      border: '1px solid #ccc',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transform: 'scale(1.02)',
      },
    }}
  >
    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2,
        bgcolor: '#f5f5f5',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
          {area.location}
        </Typography>
        <Typography variant="body2" sx={{ color: '#777' }}>
          {area.whatsappNumber}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
        {area.price} ILS
      </Typography>
      <Button
        startIcon={<SettingsIcon />}
        variant="contained"
        size="small"
        sx={{
          bgcolor: '#1976d2',
          color: '#fff',
          '&:hover': {
            bgcolor: '#1565c0',
          },
        }}
        onClick={() => onManage(area)}
      >
        Manage
      </Button>
    </CardContent>
  </Card>
);

export default DeliveryAreaCard;
