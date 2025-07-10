// src/components/DeliveryAreas/DeliveryAreaCard.tsx
import React from 'react';
import RoomIcon from '@mui/icons-material/Room';
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { DelieveryMethod } from '../../../Types';
import useLanguage from '../../../hooks/useLanguage';

interface Props {
  area: DelieveryMethod;
  onManage: (area: DelieveryMethod) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (area: DelieveryMethod) => void;
  onToggleActive?: (area: DelieveryMethod) => void;
  onSetDefault?: (area: DelieveryMethod) => void;
  language: 'ENGLISH' | 'ARABIC';
  loading?: boolean;
}

const DeliveryAreaCard: React.FC<Props> = ({ 
  area, 
  onManage, 
  language, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onSetDefault, 
  loading = false 
}) => {
  const { t, isRTL: hookIsRTL } = useLanguage();
  const isRTL = language === 'ARABIC' || hookIsRTL;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(area);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onManage(area);
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleActive) {
      onToggleActive(area);
    }
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetDefault) {
      onSetDefault(area);
    }
  };

  return (
    <div
      onClick={onEdit}
      className={`w-full cursor-pointer flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'
      } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Location Info */}
      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
          <RoomIcon style={{ fontSize: 20 }} />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-primary">
            {isRTL ? area.locationAr || area.location : area.locationEn || area.location}
          </span>
          <span className="text-sm text-gray-500">{area.whatsappNumber}</span>
          <div className="flex gap-1 mt-1">
            <span
              className={`px-2 py-0.5 text-xs rounded font-medium ${
                area.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {area.isActive ? t('deliveryDetails.active') : t('deliveryDetails.inactive')}
            </span>
            {area.isDefault && (
              <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-medium">
                {t('deliveryDetails.default')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} onClick={e => e.stopPropagation()}>
        <div className="min-w-[70px] text-center text-sm font-bold text-primary border border-primary px-3 py-1 rounded-full bg-primary/10">
          {area.price} <span className="text-[10px] font-normal text-gray-500">ILS</span>
        </div>

        {onToggleActive && (
          <button
            onClick={handleToggleActive}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
            title={area.isActive ? t('deliveryDetails.tooltips.deactivate') : t('deliveryDetails.tooltips.activate')}
            type="button"
          >
            {area.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={handleSettings}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition"
          title={t('deliveryDetails.tooltips.settings')}
          type="button"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>

        {!area.isDefault && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
            title={t('deliveryDetails.tooltips.delete')}
            type="button"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}

        {onSetDefault && !area.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={!area.isActive || loading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition"
            title={
              !area.isActive
                ? t('deliveryDetails.tooltips.cannotSetInactiveAsDefault')
                : t('deliveryDetails.tooltips.setDefault')
            }
            type="button"
          >
            <StarIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryAreaCard;
