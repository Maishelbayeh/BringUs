import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Tooltip } from '@mui/material';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

import logo from '../../../assets/bringus.svg';
type TopNavbarProps = {
  // userName: string;
  userPosition: string;
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
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        <div className={`flex items-center gap-2 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}> 
          <img src={logo} alt="logo" className="h-7 w-7" />
          <span className="hidden sm:inline sm:text-2xl font-bold text-primary tracking-wide">bring us</span>
        </div>
      </div>
        {/* Language icon only on mobile, full switcher on desktop */}

        <div className={`flex items-center gap-4 justify-center flex-row ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
          {/* Payment & Delivery Icons */}
          <button
            onClick={() => navigate('/payment-methods')}
            className="p-2 rounded-full hover:bg-primary/10 transition"
            title={t('paymentMethods.title') || 'Payment Methods'}
          >
            <CreditCardIcon className="h-6 w-6 text-primary" />
          </button>
          <button
            onClick={() => navigate('/delivery-settings')}
            className="p-2 rounded-full hover:bg-primary/10 transition"
            title={t('deliveryDetails.title') || 'Delivery Methods'}
          >
            <TruckIcon className="h-6 w-6 text-primary" />
          </button>
          <Tooltip title={language === 'ARABIC' ? 'العربية' : 'English'} arrow>
            <button
              onClick={onLanguageToggle}
              className="flex items-center justify-center rounded-full bg-primary shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none h-10 w-10"
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <GlobeAltIcon className="h-6 w-6 text-white" />
            </button>
          </Tooltip>
          <span className="hidden sm:inline-block ml-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-sm border border-primary/20">
            {language === 'ARABIC' ? 'العربية' : 'English'}
          </span>
          {/* User avatar and name, smaller on mobile, no last login */}
          {/* <div className="flex items-center gap-2 text-gray-800 ">
            <img
              src="public/user.jpg"
              alt="User"
              className="mx-auto rounded-full border-2 border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="font-medium text-sm sm:text-base">{userName}</span>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
