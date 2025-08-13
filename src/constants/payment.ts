// Payment API Constants
export const PAYMENT_API_CONFIG = {
  BASE_URL: 'https://api.lahza.io/transaction',
  SECRET_KEY: 'sk_test_aJgxg75kYKtW6qVuTgijJyzpuhszRSvc4',
  CALLBACK_URL: 'http://localhost:5173/',
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
