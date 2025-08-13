import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';

interface StoreStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'active' | 'inactive') => void;
  currentStatus: 'active' | 'inactive';
  storeName: string;
}

const StoreStatusModal: React.FC<StoreStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  storeName
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>(currentStatus);

  const handleConfirm = () => {
    onConfirm(newStatus);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {t('stores.updateStatusTitle')}
          </span>
          <button
            onClick={onClose}
            className="text-primary hover:text-red-500 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {t('stores.updateStatusMessage')} <strong>{storeName}</strong>
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('stores.newStatus')}
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">{t('stores.status.active')}</option>
              <option value="inactive">{t('stores.status.inactive')}</option>
            </select>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('general.cancel')}
          </button>
          
          <button
            onClick={handleConfirm}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('general.update')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreStatusModal; 