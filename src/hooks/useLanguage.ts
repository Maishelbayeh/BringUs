import i18n from 'i18next';
import { useState, useEffect } from 'react';

const useLanguage = () => {
  const [language, setLanguage] = useState<'ENGLISH' | 'ARABIC'>(i18n.language === 'ARABIC' ? 'ARABIC' : 'ENGLISH');

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLanguage(lng === 'ARABIC' ? 'ARABIC' : 'ENGLISH');
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ENGLISH' ? 'ARABIC' : 'ENGLISH';
    i18n.changeLanguage(newLanguage);
  };

  return { language, toggleLanguage };
};

export default useLanguage; 