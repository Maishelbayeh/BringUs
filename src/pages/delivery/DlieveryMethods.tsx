// src/components/PaymentMethods/DeliveryMethods.tsx
import React, { useState } from 'react';
import { DelieveryMethod } from '../../Types';
import DlieveryCard from './componant/DlieveryCard';
import Delieverydrawer from './componant/Delieverydrawer';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';   
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import { initialDeliveryMethods } from '../../data/initialDeliveryMethods';

const DeliveryMethods: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [areas, setAreas] = useState<DelieveryMethod[]>(initialDeliveryMethods);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<DelieveryMethod | null>(null);
  const isEditMode = current !== null;
  //-------------------------------------------- openDrawer -------------------------------------------
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
    <div className='bg-white sm:p-4'>
        <CustomBreadcrumb items={[
          { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
          { name: t('deliveryDetails.title') || 'Delivery Methods', href: '/delivery-methods' }
        ]} isRtl={language === 'ARABIC'} />
      <HeaderWithAction
        title={t('deliveryDetails.title')}
        addLabel={t('deliveryDetails.addNewDeliveryArea')}
        onAdd={openDrawer}
        isRtl={language === 'ARABIC'}
        count={areas.length}
      />
    
      <div className='flex flex-wrap gap-2'>
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
      </div>

      <Delieverydrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        area={current}
        language={language}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default DeliveryMethods;
