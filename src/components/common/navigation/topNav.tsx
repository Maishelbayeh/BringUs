import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/outline';

import logo from '../../../assets/bringus.svg';
type TopNavbarProps = {
  userName: string;
  userPosition: string;
  language: string;
  onLanguageToggle: () => void;
  onMenuToggle: () => void;
};

const TopNavbar: React.FC<TopNavbarProps> = ({
  userName,
  language,
  onLanguageToggle,
  onMenuToggle,
}) => {
  const { t } = useTranslation();

  return (
    <header className={`w-full bg-white px-2 sm:px-4 py-2 sm:py-4`}> 
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
          
          <button
            onClick={onLanguageToggle}
            className="flex items-center text-gray-700 hover:text-primary transition-colors duration-300"
          >
            <ArrowDownIcon className="h-5 w-5 text-primary hover:text-primary-light 
            text-align-center " />
            <div className="hidden sm:inline flex flex-row bg-gray-100  font-semibold rounded-md text-sm gap-2 px-2 py-1">
            <span className="hidden sm:inline ">
              {t('general.language')}: {language}
            
            </span>
          
            </div>
          </button>
          {/* User avatar and name, smaller on mobile, no last login */}
          <div className="flex items-center gap-2 text-gray-800 ">
            <img
              src="public/user.jpg"
              alt="User"
              className="mx-auto rounded-full border-2 border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="font-medium text-sm sm:text-base">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
