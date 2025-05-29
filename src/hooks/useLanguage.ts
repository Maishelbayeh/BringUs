import { useState } from 'react';
import i18n from 'i18next';

const useLanguage = () => {
  const [language, setLanguage] = useState<'ENGLISH' | 'ARABIC'>('ENGLISH');

  const toggleLanguage = () => {
    const newLanguage = language === 'ENGLISH' ? 'ARABIC' : 'ENGLISH';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    console.log(`Language changed to: ${newLanguage}`);
  };

  return { language, toggleLanguage };
};

export default useLanguage; 