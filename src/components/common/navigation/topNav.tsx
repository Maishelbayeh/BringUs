import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowCircleDownIcon } from '@heroicons/react/outline';
import { MenuIcon } from '@heroicons/react/outline';

type TopNavbarProps = {
  userName: string;
  userPosition: string;
  language: string;
  onLanguageToggle: () => void;
  onMenuToggle: () => void;
};

const TopNavbar: React.FC<TopNavbarProps> = ({
  userName,
  userPosition,
  language,
  onLanguageToggle,
  onMenuToggle,
}) => {
  const { t } = useTranslation();

  return (
    <header className={`w-full h-20 bg-white px-6 py-4 flex items-center justify-between ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
      <div className='flex flex-row gap-2'>
         {/* <div className="text-lg font-bold text-gray-800">{t('dashboard.greeting', { name: userName })}</div> */}

         <button
          onClick={onMenuToggle}
          className="text-gray-800 hover:text-gray-500 focus:outline-none"
        >
          <MenuIcon className="h-6 w-6" />
        </button> 
        </div>
       
      <div className={`flex items-center gap-6 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-semibold">{t('general.language')}:</span>
          <span className="bg-gray-100 flex flex-row font-semibold rounded-md text-sm gap-2 px-2 py-1">
            {language}
            <button
              onClick={onLanguageToggle}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              <ArrowCircleDownIcon className="h-5 w-5" />
            </button>
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-800">
          <img
            src="public/user.jpg"
            alt="User"
            className="mx-auto h-10 w-10 rounded-full border-2 border-gray-300"
          />
          <div className="flex flex-col">
            <span className="font-medium">{userName}</span>
            <span className="text-sm text-gray-500">{t('general.lastSignIn')}</span>
          </div>
        </div>
    
      </div>
    </header>
  );
};

export default TopNavbar;
