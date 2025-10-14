export const currencyOptions = [
  { id: 1, code: 'ILS', symbolAr: '₪', symbolEn: '₪', nameAr: 'شيكل', nameEn: 'Israeli Shekel' },
  { id: 2, code: 'USD', symbolAr: '$', symbolEn: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
  { id: 3, code: 'EUR', symbolAr: '€', symbolEn: '€', nameAr: 'يورو', nameEn: 'Euro' },
  { id: 4, code: 'GBP', symbolAr: '£', symbolEn: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound' },
  { id: 5, code: 'SAR', symbolAr: 'ر.س', symbolEn: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
  { id: 6, code: 'AED', symbolAr: 'د.إ', symbolEn: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
  { id: 7, code: 'QAR', symbolAr: 'ر.ق', symbolEn: 'QAR', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal' },
  { id: 8, code: 'KWD', symbolAr: 'د.ك', symbolEn: 'KWD', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar' },
  { id: 9, code: 'BHD', symbolAr: 'د.ب', symbolEn: 'BHD', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar' },
  { id: 10, code: 'OMR', symbolAr: 'ر.ع', symbolEn: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial' },
  { id: 11, code: 'JOD', symbolAr: 'د.أ', symbolEn: 'JOD', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar' },
  { id: 12, code: 'EGP', symbolAr: 'ج.م', symbolEn: 'EGP', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound' },
  { id: 13, code: 'LBP', symbolAr: 'ل.ل', symbolEn: 'LBP', nameAr: 'ليرة لبنانية', nameEn: 'Lebanese Pound' },
  { id: 14, code: 'TRY', symbolAr: '₺', symbolEn: '₺', nameAr: 'ليرة تركية', nameEn: 'Turkish Lira' },
  { id: 15, code: 'JPY', symbolAr: '¥', symbolEn: '¥', nameAr: 'ين ياباني', nameEn: 'Japanese Yen' },
  { id: 16, code: 'CNY', symbolAr: '¥', symbolEn: '¥', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan' },
  { id: 17, code: 'INR', symbolAr: '₹', symbolEn: '₹', nameAr: 'روبية هندية', nameEn: 'Indian Rupee' },
  { id: 18, code: 'CAD', symbolAr: '$', symbolEn: 'CA$', nameAr: 'دولار كندي', nameEn: 'Canadian Dollar' },
  { id: 19, code: 'AUD', symbolAr: '$', symbolEn: 'A$', nameAr: 'دولار أسترالي', nameEn: 'Australian Dollar' },
  { id: 20, code: 'CHF', symbolAr: 'ف.س', symbolEn: 'CHF', nameAr: 'فرنك سويسري', nameEn: 'Swiss Franc' },
];

/**
 * دالة للحصول على رمز العملة حسب اللغة
 * @param currencyCode - كود العملة (مثل: ILS, USD, EUR)
 * @param isRTL - هل اللغة من اليمين لليسار (عربي)
 * @returns رمز العملة المناسب للغة
 */
export const getCurrencySymbol = (currencyCode: string, isRTL: boolean): string => {
  const currency = currencyOptions.find(c => c.code === currencyCode);
  return currency ? (isRTL ? currency.symbolAr : currency.symbolEn) : currencyCode;
};

/**
 * دالة للحصول على اسم العملة حسب اللغة
 * @param currencyCode - كود العملة (مثل: ILS, USD, EUR)
 * @param isRTL - هل اللغة من اليمين لليسار (عربي)
 * @returns اسم العملة المناسب للغة
 */
export const getCurrencyName = (currencyCode: string, isRTL: boolean): string => {
  const currency = currencyOptions.find(c => c.code === currencyCode);
  return currency ? (isRTL ? currency.nameAr : currency.nameEn) : currencyCode;
};
