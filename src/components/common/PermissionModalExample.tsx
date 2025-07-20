import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionModal from './PermissionModal';
import CustomButton from './CustomButton';

// Example component showing different ways to use PermissionModal
const PermissionModalExample: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC';
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    itemType: '',
    severity: 'danger' as 'warning' | 'danger' | 'info',
    requirePermission: true
  });

  const handleDeleteWithPermission = (item: any, itemType: string) => {
    setModalConfig({
      isOpen: true,
      title: t('general.confirmDelete'),
      message: t('general.deleteConfirmationMessage', { itemType }),
      itemName: item.name || item.title || item.id,
      itemType,
      severity: 'danger',
      requirePermission: true
    });
  };

  const handleWarningAction = (item: any, itemType: string) => {
    setModalConfig({
      isOpen: true,
      title: t('general.warning'),
      message: `Are you sure you want to perform this action on ${itemType}?`,
      itemName: item.name || item.title || item.id,
      itemType,
      severity: 'warning',
      requirePermission: false
    });
  };

  const handleInfoAction = (item: any, itemType: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Information',
      message: `This is an informational message about ${itemType}`,
      itemName: item.name || item.title || item.id,
      itemType,
      severity: 'info',
      requirePermission: false
    });
  };

  const handleConfirm = () => {
    //CONSOLE.log('Action confirmed!');
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleClose = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const exampleItems = [
    { id: 1, name: 'Product A', type: 'product' },
    { id: 2, name: 'Customer B', type: 'customer' },
    { id: 3, name: 'Order #123', type: 'order' }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Permission Modal Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exampleItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">{item.name}</h3>
            <div className="space-y-2">
              <CustomButton
                color="red"
                textColor="white"
                text={`Delete ${item.type}`}
                action={() => handleDeleteWithPermission(item, item.type)}
                className="w-full"
              />
              <CustomButton
                color="yellow"
                textColor="white"
                text={`Warning ${item.type}`}
                action={() => handleWarningAction(item, item.type)}
                className="w-full"
              />
              <CustomButton
                color="blue"
                textColor="white"
                text={`Info ${item.type}`}
                action={() => handleInfoAction(item, item.type)}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={modalConfig.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        itemName={modalConfig.itemName}
        itemType={modalConfig.itemType}
        severity={modalConfig.severity}
        requirePermission={modalConfig.requirePermission}
        isRTL={isRTL}
      />
    </div>
  );
};

export default PermissionModalExample; 