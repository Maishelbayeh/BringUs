// src/utils/storeUtils.ts
// دوال مساعدة للتعامل مع معرف المتجر

/**
 * دالة للحصول على معرف المتجر من localStorage أو بيانات المستخدم
 */

export const getStoreId = (): string => {
  // أولاً: البحث في localStorage
  const storedStoreId = localStorage.getItem('storeId');
  if (storedStoreId && storedStoreId.trim()) {
    return storedStoreId;
  }
  
  // ثانياً: البحث في بيانات المستخدم المحفوظة
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.store?.id) {
        return user.store.id;
      }
    }
  } catch (error) {
    console.warn('Error parsing user data from localStorage:', error);
  }
  
  // ثالثاً: البحث في بيانات المتجر المحفوظة
  try {
    const storeData = localStorage.getItem('storeInfo');
    if (storeData) {
      const store = JSON.parse(storeData);
      if (store?.id) {
        return store.id;
      }
    }
  } catch (error) {
    console.warn('Error parsing store data from localStorage:', error);
  }
  
  // إذا لم نجد المعرف، نرجع نص فارغ
  console.warn('Store ID not found in localStorage or user data');
  return '';
};

/**
 * دالة لحفظ معرف المتجر في localStorage
 */
export const setStoreId = (storeId: string): void => {
  if (storeId && storeId.trim()) {
    localStorage.setItem('storeId', storeId);
  }
};

/**
 * دالة لحذف معرف المتجر من localStorage
 */
export const removeStoreId = (): void => {
  localStorage.removeItem('storeId');
};

/**
 * دالة للتحقق من وجود معرف المتجر
 */
export const hasStoreId = (): boolean => {
  const storeId = getStoreId();
  return storeId.length > 0;
};

/**
 * دالة للحصول على معلومات المتجر الكاملة
 */
export const getStoreInfo = (): any => {
  try {
    const storeData = localStorage.getItem('storeInfo');
    if (storeData) {
      return JSON.parse(storeData);
    }
    
    // البحث في بيانات المستخدم
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.store) {
        return user.store;
      }
    }
  } catch (error) {
    console.warn('Error parsing store info from localStorage:', error);
  }
  
  return null;
};

/**
 * دالة لإنشاء رابط مسوق فريد
 */
export const generateAffiliateLink = (): string => {
  const storeInfo = getStoreInfo();
  if (!storeInfo?.slug) {
    console.warn('Store slug not found');
    return '';
  }
  
  // إنشاء نص عشوائي للمسوق (8 أحرف)
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const randomString = generateRandomString(8);
  return `https://${storeInfo.slug}.bringus.com/affiliate/${randomString}`;
};

/**
 * دالة للتحقق من عدم تكرار رابط المسوق
 */
export const isAffiliateLinkUnique = (link: string, existingAffiliates: any[]): boolean => {
  return !existingAffiliates.some(affiliate => affiliate.affiliateLink === link);
}; 