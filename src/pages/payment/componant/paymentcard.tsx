// src/components/PaymentMethods/componant/PaymentCard.tsx
import React from 'react';
import { PencilSquareIcon, TrashIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';

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
  const isRTL = language === 'ARABIC';
  return (
    <div
      className={`flex items-center justify-between bg-primary/5  shadow-md rounded-xl px-5 py-3  gap-4  hover:shadow-md transition-all duration-200 cursor-pointer ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
      style={{ minHeight: 64 }}
      onClick={() => onClick(method)}
    >
      {/* شعار أو أول حرف واسم الطريقة */}
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        {method.logoUrl ? (
          <img src={method.logoUrl} alt={method.title} className="w-10 h-10 rounded-full bg-white border border-primary object-contain" />
        ) : (
          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white text-lg font-bold border border-primary">
            {method.title.charAt(0)}
          </span>
        )}
        <span className="font-bold text-primary text-lg">{isRTL ? method.titleAr : method.titleEn}</span>
      </div>
      {/* أزرار العمليات أو بادج الافتراضي */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} onClick={e => e.stopPropagation()}>
        {method.isDefault ? (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            {t('paymentMethods.default')}
          </span>
        ) : (
          <>
            <button
              onClick={() => onEdit(method)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition"
              title={t('paymentMethods.edit') as string}
              type="button"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(method.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
              title={t('paymentMethods.delete') as string}
              type="button"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSetDefault(method.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition"
              title={t('paymentMethods.setDefault') as string}
              type="button"
            >
              <StarIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
