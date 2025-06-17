// src/components/PaymentMethods/DeliveryMethods.tsx
import React, { useState } from 'react';
import { Box, Typography, Divider} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DelieveryMethod } from '../../Types';
import DlieveryCard from './componant/DlieveryCard';
import Delieverydrawer from './componant/Delieverydrawer';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/common/CustomButton';
import useLanguage from '../../hooks/useLanguage';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';

// dummy initial data
const INITIAL_DELIVERY: DelieveryMethod[] = [
  { id: 1, locationAr: 'الضفة الغربية', locationEn: 'West Bank', price: 20, whatsappNumber: '+970598516067' },
  { id: 2, locationAr: 'القدس', locationEn: 'Jerusalem', price: 30, whatsappNumber: '+970598516067' },
  { id: 3, locationAr: 'الداخل', locationEn: '1948 Areas', price: 70, whatsappNumber: '+970598516067' },
];



const DeliveryMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [areas, setAreas] = useState<DelieveryMethod[]>(INITIAL_DELIVERY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<DelieveryMethod | null>(null);
  const isEditMode = current !== null;

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null, path: '/' },
    { name: t('deliveryDetails.title') || 'Delivery Methods', id: 1, path: '/delivery-settings' }
  ];

  // Open drawer for add
  const openDrawer = () => {
    setCurrent(null);
    setDrawerOpen(true);
  };
  // Open drawer for edit
  const openDrawerEdit = (area: DelieveryMethod) => {
    setCurrent(area);
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, minHeight: '100vh' }} className='bg-white'>
      {/* Breadcrumb */}
      <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={item.id}>
            <span className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`} onClick={() => navigate(item.path)}>{item.name}</span>
            {idx < breadcrumb.length - 1 && <ChevronRightIcon className={`h-4 w-4 mx-2 ${language === 'ARABIC' ? 'rotate-180' : ''}`} />}
          </React.Fragment>
        ))}
      </nav>
      <Box
        sx={{
          display: 'flex',
          flexDirection: language === 'ARABIC' ? { xs: 'column', sm: 'row-reverse' } : { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', textAlign: language === 'ARABIC' ? 'right' : 'left' }}
            className='text-primary'
          >
            {t('deliveryDetails.title')}
          </Typography>
          <Typography
            variant="body2"
            className='text-body'
            paragraph
            sx={{ textAlign: language === 'ARABIC' ? 'right' : 'left' }}
          >
            {t('deliveryDetails.description')}
          </Typography>
        </Box>
        <CustomButton
          color="primary"
          text={ t('deliveryDetails.addNewDeliveryArea')}
          alignment={language === 'ARABIC' ? 'right' : 'left'}
          action={openDrawer}
          icon={<AddIcon />}
          textColor="white"
        />
      </Box>

      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
        {areas.map(area => (
          <DlieveryCard
            key={area.id}
            area={area}
            onManage={() => openDrawerEdit(area)}
            onClick={() => openDrawerEdit(area)}
            onEdit={() => openDrawerEdit(area)}
            onDelete={handleDelete}
            language={language}
          />
        ))}
      </Box>

      <Delieverydrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        area={current}
        language={language}
        isEditMode={isEditMode}
      />
    </Box>
  );
};

export default DeliveryMethods;
