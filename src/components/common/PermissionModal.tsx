import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Warning, 
  Delete, 
  Error,
  Close,
  CheckCircle
} from '@mui/icons-material';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  requirePermission?: boolean;
  permissionText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isRTL?: boolean;
  severity?: 'warning' | 'danger' | 'info';
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName = '',
  itemType = 'item',
  requirePermission = true,
  permissionText,
  confirmButtonText,
  cancelButtonText,
  isRTL = false,
  severity = 'danger'
}) => {
  const { t } = useTranslation();
  const [permissionInput, setPermissionInput] = useState('');
  const [, setIsConfirmed] = useState(false);

  // Default texts
  const defaultTitle = title || t('general.confirmDelete', 'Confirm Delete');
  const defaultMessage = message || t('general.deleteConfirmationMessage', 'Are you sure you want to delete this {{itemType}}?', { itemType });
  const defaultPermissionText = permissionText || t('general.typeToConfirm', 'Type "DELETE" to confirm');
  const defaultConfirmText = confirmButtonText || t('general.delete', 'Delete');
  const defaultCancelText = cancelButtonText || t('general.cancel', 'Cancel');

  // Severity styles
  const severityStyles = {
    warning: {
      icon: <Warning className="text-yellow-500 text-4xl" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    danger: {
      icon: <Error className="text-red-500 text-4xl" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    },
    info: {
      icon: <CheckCircle className="text-blue-500 text-4xl" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    }
  };

  const currentStyle = severityStyles[severity];

  const handleConfirm = () => {
    if (!requirePermission || permissionInput === 'DELETE') {
      setIsConfirmed(true);
      onConfirm();
      handleClose();
    }
  };

  const handleClose = () => {
    setPermissionInput('');
    setIsConfirmed(false);
    onClose();
  };

  const isPermissionValid = !requirePermission || permissionInput === 'DELETE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative ${isRTL ? 'text-right' : 'text-left'}`}
           dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${currentStyle.borderColor}`}>
          <div className="flex items-center gap-3">
            {currentStyle.icon}
            <h2 className="text-xl font-bold text-gray-900">{defaultTitle}</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Close className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`mb-6 p-4 rounded-lg ${currentStyle.bgColor} border ${currentStyle.borderColor}`}>
            <p className={`text-sm ${currentStyle.textColor} mb-2`}>
              {defaultMessage}
            </p>
            {itemName && (
              <div className="bg-white rounded p-3 border">
                <p className="font-semibold text-gray-900">{itemName}</p>
              </div>
            )}
          </div>

          {/* Permission Input */}
          {requirePermission && (
            <div className="mb-6">
              <CustomInput
                label={defaultPermissionText}
                type="text"
                value={permissionInput}
                onChange={(e) => setPermissionInput(e.target.value)}
                placeholder="DELETE"
                error={permissionInput && !isPermissionValid ? t('general.invalidPermission', 'Please type "DELETE" exactly') : undefined}
              />
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <Delete className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {t('general.warning', 'Warning')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('general.deleteWarning', 'This action cannot be undone. The {{itemType}} will be permanently deleted.', { itemType })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <CustomButton
            color="white"
            textColor="gray"
            text={defaultCancelText}
            action={handleClose}
            className="flex-1"
          />
          <button
            onClick={handleConfirm}
            disabled={!isPermissionValid}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isPermissionValid 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Delete className="text-lg" />
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal; 