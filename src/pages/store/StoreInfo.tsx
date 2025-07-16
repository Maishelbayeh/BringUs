import React from 'react';
import StoreGeneralInfo from './StoreGeneralInfo';
import useLanguage from '@/hooks/useLanguage';


const StoreInfo: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';

  return (
    <div className={`min-h-screen bg-primary-50 p-10 ${isRTL ? 'text-right' : 'text-left'}`}>
      <StoreGeneralInfo />
    </div>
  );
};

export default StoreInfo; 