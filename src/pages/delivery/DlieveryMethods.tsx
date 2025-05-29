// src/components/PaymentMethods/DeliveryMethods.tsx
import React, { useState } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DelieveryMethod, DeliveryArea } from '../../Types';
import DlieveryCard from './componant/DlieveryCard';
import Delieverydrawer from './componant/Delieverydrawer';
import { useTranslation } from 'react-i18next';

// dummy initial data
const INITIAL_DELIVERY: DelieveryMethod[] = [
  { id: 1, location: 'الضفة الغربية', price: 20, whatsappNumber: '+970598516067' },
  { id: 2, location: 'القدس',          price: 30, whatsappNumber: '+970598516067' },
  { id: 3, location: 'الداخل',         price: 70, whatsappNumber: '+970598516067' },
];

interface Props {
  method: DelieveryMethod;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const DeliveryMethods: React.FC = () => {
  const { t } = useTranslation();
  const [areas, setAreas] = useState<DelieveryMethod[]>(INITIAL_DELIVERY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<DelieveryMethod | null>(null);
  const isEditMode = current !== null;

  const openDrawer = (area?: DelieveryMethod) => {
    setCurrent(area ?? null);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(null);
  };

  const handleSave = (area: DelieveryMethod) => {
    setAreas(prev =>
      prev.some(a => a.id === area.id)
        ? prev.map(a => (a.id === area.id ? area : a))
        : [...prev, area]
    );
    closeDrawer();
  };

  const handleDelete = (id: number) => {
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('Delivery Details')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('Configure your delivery areas, fees and WhatsApp contact.')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDrawer()}
        >
          {isEditMode ? t('Edit Delivery Area') : t('Add New Delivery Area')}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {areas.map(area => (
          <DlieveryCard
            key={area.id}
            area={area}
            onManage={() => openDrawer(area)}
            onClick={() => openDrawer(area)}
            onEdit={() => openDrawer(area)}
            onDelete={handleDelete}
          />
        ))}
      </Box>

      <Delieverydrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave} area={current}      />
    </Box>
  );
};

export default DeliveryMethods;
