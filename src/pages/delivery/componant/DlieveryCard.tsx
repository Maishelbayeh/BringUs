// src/components/DeliveryAreas/DeliveryAreaCard.tsx
import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import RoomIcon from '@mui/icons-material/Room';
import { DeliveryArea } from '../../../Types';
import CustomButton from '../../../components/common/CustomButton';


interface Props {
  area: DeliveryArea;
  onManage: (area: DeliveryArea) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
  language: 'ENGLISH' | 'ARABIC';
}

const DeliveryAreaCard: React.FC<Props> = ({ area, onManage, language }) => {
  const isRTL = language === 'ARABIC';

  return (
    <div
      className={`flex items-center justify-between bg-primary/5 shadow-md rounded-xl px-4 py-3  gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
      style={{ minHeight: 60 }}
    >
      {/* بيانات المنطقة: أيقونة + اسم + هاتف */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="inline-flex items-center justify-center bg-primary/90 text-white rounded-full w-7 h-7">
          <RoomIcon style={{ fontSize: 16 }} />
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-primary text-base leading-tight">{isRTL ? (area.locationAr || area.location) : (area.locationEn || area.location)}</span>
          <span className="text-gray-500 text-xs mt-0.5">{area.whatsappNumber}</span>
        </div>
      </div>
      {/* السعر وزر الإعدادات */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="inline-block bg-primary-light border border-primary text-primary font-bold px-3 py-1 rounded-full text-xs min-w-[54px] text-center">
          {area.price} <span className="text-[10px] font-medium text-gray-500">ILS</span>
        </span>
        <CustomButton
          color="primary"
          text={''}
          action={() => onManage(area)}
          icon={<SettingsIcon style={{ fontSize: 20 }} />}
          textColor="white"
          style={{ borderRadius: '50%', minWidth: 32, minHeight: 32, width: 32, height: 32, padding: 0 }}
          className="shadow-sm hover:shadow"
        />
      </div>
    </div>
  );
};

export default DeliveryAreaCard;


