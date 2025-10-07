import { getLahzaSecretKey } from '../hooks/useLocalStorage';

// Get the secret key and log it for debugging
const secretKey = getLahzaSecretKey() || '';
console.log('🔐 Lahza Secret Key from localStorage:', secretKey || 'No key found - using empty string');
console.log('📊 Payment Config Loaded:', {
  baseUrl: 'https://api.lahza.io/transaction',
  secretKey:'sk_test_aJgxg75kYKtW6qVuTgijJyzpuhszRSvc4',
  callbackUrl: 'http://localhost:5174/'
});

// Payment API Constants
export const PAYMENT_API_CONFIG = {
  BASE_URL: 'https://api.lahza.io/transaction',
  SECRET_KEY: 'sk_test_aJgxg75kYKtW6qVuTgijJyzpuhszRSvc4', // Using stored secret key or empty string
  CALLBACK_URL: 'http://localhost:5174/',
  ENDPOINTS: {
    CHARGES: '/initialize',
    VERIFY: '/verify'
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
