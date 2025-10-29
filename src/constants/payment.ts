import { getStoreInfo } from '../utils/storeUtils';

// Get store info for dynamic callback URL
const getCallbackUrl = () => {
  const storeInfo = getStoreInfo();
  const storeSlug = storeInfo?.slug;
  
  if (storeSlug) {
    return `https://bringus.onrender.com/${storeSlug}`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:5174/';
};

// Get backend API base URL
const getBackendBaseUrl = () => {
  // Use environment variable or fallback to production
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

console.log('📊 Payment Config Loaded:', {
  backendUrl: getBackendBaseUrl(),
  callbackUrl: getCallbackUrl()
});

// Payment API Constants - Now using backend proxy for security
export const PAYMENT_API_CONFIG = {
  BACKEND_URL: getBackendBaseUrl(),
  CALLBACK_URL: getCallbackUrl(), // Dynamic callback URL based on store slug
  ENDPOINTS: {
    INITIALIZE: '/lahza-payment/:storeId/initialize',
    VERIFY: '/lahza-payment/:storeId/verify',
    STATUS: '/lahza-payment/:storeId/status/:reference',
    WEBHOOK: '/lahza-payment/:storeId/webhook',
    POLL: '/lahza-payment/:storeId/poll/:reference'
  }
};

// Currency conversion rates (to smallest unit)
export const CURRENCY_CONVERSION = {
  ILS: 100, // 1 ILS = 100 aghora
  JOD: 100, // 1 JOD = 100 qirsh
  USD: 100  // 1 USD = 100 cents
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ' }
];
