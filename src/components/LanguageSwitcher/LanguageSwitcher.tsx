import React from 'react';
import i18next from 'i18next';

type LanguageSwitcherProps = {
  icon: string; 
  lang: string; 
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ icon, lang }) => {
  const handleLanguageChange = () => {
    i18next.changeLanguage(lang); 
  };

  return (
    <div className="language-switcher">
      <button onClick={handleLanguageChange}>
        <img src={icon} alt={`${lang} language`} />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
