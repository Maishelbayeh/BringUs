// src/components/DeliveryAreas/DeliveryAreaCard.tsx
import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import RoomIcon from '@mui/icons-material/Room';
import DeleteIcon from '@mui/icons-material/Delete';
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
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="min-w-[70px] text-center text-sm font-bold text-primary border border-primary px-3 py-1 rounded-full bg-primary/10">
          {area.price} <span className="text-[10px] font-normal text-gray-500">ILS</span>
        </div>

                {onToggleActive && (
          <button
            onClick={handleToggleActive}
            disabled={area.isDefault || loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all shadow-sm ${
              area.isDefault
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : area.isActive
                ? 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-md'
                : 'bg-yellow-400 hover:bg-yellow-500 hover:shadow-md'
            }`}
            title={area.isActive ? t('deliveryDetails.tooltips.deactivate') : t('deliveryDetails.tooltips.activate')}
            type="button"
          >
            {area.isActive ? '✓' : '✗'}
          </button>
        )}

        {onSetDefault && (
          <button
            onClick={handleSetDefault}
            disabled={area.isDefault || !area.isActive || loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-all shadow-sm ${
              area.isDefault || !area.isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md'
            }`}
            title={
              area.isDefault
                ? t('deliveryDetails.tooltips.alreadyDefault')
                : !area.isActive
                ? t('deliveryDetails.tooltips.cannotSetInactiveAsDefault')
                : t('deliveryDetails.tooltips.setDefault')
            }
            type="button"
          >
            ⭐
          </button>
        )}
        
        <button
          onClick={handleSettings}
          disabled={loading}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white transition-all shadow-sm hover:shadow-md"
          type="button"
          title={t('deliveryDetails.tooltips.settings')}
        >
          <SettingsIcon style={{ fontSize: 18 }} />
        </button>

        <button
          onClick={handleDelete}
          disabled={area.isDefault || loading}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            area.isDefault
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-md'
          }`}
          title={area.isDefault ? t('deliveryDetails.tooltips.cannotDeleteDefault') : t('deliveryDetails.tooltips.delete')}
          type="button"
        >
          <DeleteIcon style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
};

export default DeliveryAreaCard;
