import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Tooltip } from '@mui/material';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

import logo from '../../../assets/bringus.svg';

import { getStoreName, getStoreLogo } from '../../../hooks/useLocalStorage';
import { useStoreUrls } from '../../../hooks/useStoreUrls';
import SubscriptionRenewalPopup from '../SubscriptionRenewalPopup';
import { useUserStore } from '../../../hooks/useUserStore';
import { useSubscription } from '../../../hooks/useSubscription';
type TopNavbarProps = {
  // userName: string;
  language: string;
  onLanguageToggle: () => void;
  onMenuToggle: () => void;
};

const TopNavbar: React.FC<TopNavbarProps> = ({
  // userName,
  language,
  onLanguageToggle,
  onMenuToggle,
}) => {
const role=JSON.parse(localStorage.getItem('userInfo') || '{}').role;
console.log(role);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { storeSlug } = useStoreUrls();
  const [storeName, setStoreName] = useState(getStoreName(language) || 'bring us');
  const [storeLogo, setStoreLogo] = useState(getStoreLogo());
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const { storeId, userId } = useUserStore();
  const { isExpired, isExpiringSoon, getDaysUntilExpiry } = useSubscription();

  // الاستماع لتحديث بيانات المتجر
  useEffect(() => {
    const handleStoreDataUpdate = (event: CustomEvent) => {
      const { nameAr, nameEn, logo } = event.detail;
      const newStoreName = language === 'ARABIC' ? localStorage.getItem('storeNameAr') : localStorage.getItem('storeNameEn');
      setStoreName(newStoreName || 'bring us');
      if (logo?.url) {
        setStoreLogo(logo.url);
      }
    };

    window.addEventListener('storeDataUpdated', handleStoreDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storeDataUpdated', handleStoreDataUpdate as EventListener);
    };
  }, [language]);

  return (
    <header className={`w-full bg-white px-2 sm:px-4 py-2 sm:py-4 border-b border-primary/20 shadow-sm`}> 
      <div className={`flex w-full items-center justify-between gap-2 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}> 
      <div className={`flex  items-center  gap-2 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}> 

        <button
          onClick={onMenuToggle}
          className="text-gray-800 hover:text-gray-500 focus:outline-none text-primary"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div onClick={() => navigate(`/${storeSlug}/store-info-container`)} className={`cursor-pointer flex items-center gap-2 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}> 

        <div onClick={() => navigate(`/${storeSlug}/store-info-container`)} className={`cursor-pointer flex items-center gap-2 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}> 
          <img 
            src={storeLogo || logo} 
            alt="logo" 
            className="h-7 w-7 rounded-full object-cover border border-gray-200" 
          />
          <span className="hidden sm:inline sm:text-2xl font-bold text-primary tracking-wide">{storeName}</span>
        </div>
      </div>
        {/* Language icon only on mobile, full switcher on desktop */}
</div>
  

        <div className={`flex items-center gap-4 justify-center flex-row ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        {role==='admin' && ( <>
          <button
            onClick={() => navigate(`/${storeSlug}/payment-methods`)}
            className="p-2 rounded-full hover:bg-primary/10 transition"
            title={t('paymentMethods.title') || 'Payment Methods'}
          >
            <CreditCardIcon className="h-6 w-6 text-primary" />
          </button>


       
          <button
            onClick={() => navigate(`/${storeSlug}/delivery-settings`)}
            className="p-2 rounded-full hover:bg-primary/10 transition"
            title={t('deliveryDetails.title') || 'Delivery Methods'}
          >
            <TruckIcon className="h-6 w-6 text-primary" />
          </button>
          </>
        )}
          <Tooltip title={language === 'ARABIC' ? 'العربية' : 'English'} arrow>
            <button
              onClick={onLanguageToggle}
              className="flex items-center justify-center rounded-full bg-primary shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none h-10 w-10"
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <GlobeAltIcon className="h-6 w-6 text-white" />
            </button>
          </Tooltip>
          {role==='admin' && ( <>
          <button
            onClick={() => setShowSubscriptionPopup(true)}
            className={`px-3 py-2 rounded-lg transition relative cursor-pointer hover:opacity-80 ${
              isExpired() ? 'bg-red-100 text-red-700' : 
              isExpiringSoon() ? 'bg-yellow-100 text-yellow-700' : 
              'bg-green-100 text-green-700'
            }`}
            title={isExpired() ? t('subscription.expired') : 
                   isExpiringSoon() ? t('subscription.expiringSoon') : 
                   t('subscription.active')}
          >
            <div className="flex items-center gap-1">
              <CreditCardIcon className={`h-4 w-4 ${
                isExpired() ? 'text-red-600' : 
                isExpiringSoon() ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
              <span className="text-xs font-semibold">
                {isExpired() ? (
                  language === 'ARABIC' ? 'منتهي' : 'Expired'
                ) : (
                  `${getDaysUntilExpiry()} ${language === 'ARABIC' ? 'يوم' : 'days'}`
                )}
              </span>
            </div>
            {(isExpired() || isExpiringSoon()) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          </>
        )}
        </div>

      </div>

      {/* Subscription Renewal Popup */}
      <SubscriptionRenewalPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        isRTL={language === 'ARABIC'}
        storeId={storeId}
        userId={userId}
      />
    </header>
  );
};

export default TopNavbar;
