import i18n from 'i18next';
import { useState, useEffect, useCallback } from 'react';

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

  // Translation function that uses the current language
  const t = useCallback((key: string, options?: any): string => {
    return i18n.t(key, options) as string;
  }, []);

  // Check if current language is RTL
  const isRTL = language === 'ARABIC';

  return { 
    language, 
    toggleLanguage, 
    t, 
    isRTL,
    setLanguage: (lang: 'ENGLISH' | 'ARABIC') => {
      setLanguage(lang);
      i18n.changeLanguage(lang);
    }
  };
};

export default useLanguage; 