/**
 * Cookie utility functions for authentication and user data management
 */

interface CookieOptions {
  days?: number; // عدد الأيام قبل انتهاء صلاحية الكوكيز
  path?: string;
  secure?: boolean; // استخدام HTTPS فقط
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * حفظ قيمة في الكوكيز
 * @param name اسم الكوكيز
 * @param value القيمة المراد حفظها
 * @param options خيارات الكوكيز
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const {
    days = 30, // افتراضياً 30 يوم
    path = '/',
    secure = window.location.protocol === 'https:',
    sameSite = 'lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;
  
  if (secure) {
    cookieString += '; secure';
  }
  
  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
  console.log(`🍪 Cookie saved: ${name}`);
};

/**
 * قراءة قيمة من الكوكيز
 * @param name اسم الكوكيز
 * @returns القيمة أو null إذا لم توجد
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      const value = decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      return value;
    }
  }

  return null;
};

/**
 * حذف كوكيز معينة
 * @param name اسم الكوكيز
 * @param path المسار (يجب أن يطابق المسار المستخدم عند الحفظ)
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  console.log(`🗑️ Cookie deleted: ${name}`);
};

/**
 * حذف جميع الكوكيز
 */
export const deleteAllCookies = (): void => {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    deleteCookie(name);
  }
  
  console.log('🗑️ All cookies deleted');
};

/**
 * التحقق من وجود كوكيز معينة
 * @param name اسم الكوكيز
 * @returns true إذا كانت موجودة
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * حفظ كائن JSON في الكوكيز
 * @param name اسم الكوكيز
 * @param value الكائن المراد حفظه
 * @param options خيارات الكوكيز
 */
export const setCookieObject = (name: string, value: any, options: CookieOptions = {}): void => {
  const jsonString = JSON.stringify(value);
  setCookie(name, jsonString, options);
};

/**
 * قراءة كائن JSON من الكوكيز
 * @param name اسم الكوكيز
 * @returns الكائن أو null إذا لم يوجد
 */
export const getCookieObject = (name: string): any | null => {
  const value = getCookie(name);
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`❌ Error parsing cookie ${name}:`, error);
    return null;
  }
};

