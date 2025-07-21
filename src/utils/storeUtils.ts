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