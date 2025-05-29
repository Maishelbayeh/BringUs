import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './localization/en.json';
import translationAR from './localization/ar.json';

const resources = {
  ENGLISH: {
    translation: translationEN
  },
  ARABIC: {
    translation: translationAR
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ENGLISH',
    debug: true,
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n; 