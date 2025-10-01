// src/components/PaymentMethods/componant/PaymentCard.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon, StarIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, QrCodeIcon} from '@heroicons/react/24/outline';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';

interface Props {
  method: PaymentMethod;
  onEdit: (m: PaymentMethod) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onToggleActive: (id: string) => void;
  onClick: (m: PaymentMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
}

const PaymentCard: React.FC<Props> = ({ 
  method, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  onToggleActive,
  onClick, 
  language 
}) => {
  const { t } = useTranslation();
  const isRTL = language === 'ARABIC';

  const getMethodTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'digital_wallet': return 'bg-purple-100 text-purple-800';
      case 'bank_transfer': return 'bg-orange-100 text-orange-800';
      case 'qr_code': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodTypeEnIcon = (type: string) => {
    switch (type) {
      case 'cash' : return '💵';
      case 'card' : return '💳';
      case 'digital_wallet' : return '💰';
      case 'bank_transfer' : return '💰';
      case 'qr_code' : return '💰';
      case 'lahza' : return '💰';
      default: return '💰';
    }
  };

  const getMethodTypeArIcon = (type: string) => {

    switch (type) {
      case 'cash' : return 'كاش';
      case 'card' : return 'بطاقة';
      case 'digital_wallet' : return 'محفظة رقمية';
      case 'bank_transfer' : return 'تحويل بنكي';
      case 'qr_code' : return 'كود كود';
      case 'lahza' : return 'لحظة';
      default: return 'لحظنة';
    }
  };

  const methodId = method._id || method.id?.toString() || '';

  return (
    <div
      className={`w-full cursor-pointer border shadow-md rounded-xl p-6 gap-4 transition-all duration-200 hover:shadow-lg
        ${isRTL ? 'text-right' : 'text-left'}
        ${method.isDefault ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
        ${!method.isActive ? 'opacity-60' : ''}
      `}
      onClick={() => onClick(method)}
    >
      {/* Header with logo and title */}
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {method.logoUrl ? (
            <img 
              src={method.logoUrl} 
              alt={method.titleAr} 
              className="w-12 h-12 rounded-lg bg-white border border-gray-200 object-contain" 
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary text-white text-xl font-bold border border-primary">
              {isRTL ? getMethodTypeArIcon(method.methodType) : getMethodTypeEnIcon(method.methodType)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {isRTL ? method.titleAr : method.titleEn}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL ? method.descriptionAr : method.descriptionEn}
            </p>
          </div>
        </div>
        
        {/* Status badges */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {method.isDefault && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-xs">
              <CheckCircleIcon className="w-3 h-3" />
              {t('paymentMethods.default')}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            method.isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {method.isActive ? t('paymentMethods.active') : t('paymentMethods.inactive')}
          </span>
        </div>
      </div>

      {/* Method type and details */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMethodTypeColor(method.methodType)}`}>
          {t(`paymentMethods.methodTypes.${method.methodType}`)}
        </span>
      </div>

      {/* QR Code indicator */}
      {method.qrCode?.enabled && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-indigo-600">
            <QrCodeIcon className="w-4 h-4" />
            <span>{t('paymentMethods.qrCodeEnabled')}</span>
          </div>
          {method.qrCode.qrCodeImage && (
            <div className="mt-2">
              <img 
                src={method.qrCode.qrCodeImage} 
                alt="QR Code" 
                className="w-16 h-16 rounded-lg border object-contain"
              />
            </div>
          )}
        </div>
      )}

   

      {/* Action buttons */}
      <div className={`flex items-center justify-end gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} onClick={e => e.stopPropagation()}>
      {!method.isDefault && (
        <button
          onClick={() => onToggleActive(methodId)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
          title={method.isActive ? t('paymentMethods.deactivateConfirmTitle') : t('paymentMethods.activateConfirmTitle')}
          type="button"
        >
          {method.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      )}
       
            <button
              onClick={() => onEdit(method)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition"
              title={t('paymentMethods.edit')}
              type="button"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            {!method.isDefault && (
          <>
            <button
              onClick={() => onDelete(methodId)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
              title={t('paymentMethods.delete')}
              type="button"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetDefault(methodId)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition"
              title={t('paymentMethods.setDefault')}
              type="button"
            >
              <StarIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
