# Store-Based Routing System - Fixed Version

## المشكلة السابقة

كان النظام السابق يجلب معلومات المتجر من `localStorage` مرة واحدة فقط عند تحميل التطبيق، مما يعني أنه عندما يسجل المستخدم دخول بحساب تاجر آخر، لا يتم تحديث معلومات المتجر والـ slug.

## الحل المطبق

### 1. تحديث StoreContext

تم تحديث `StoreContext` لمراقبة التغييرات في:
- `localStorage` events (للتبديل بين النوافذ)
- Custom events (للتبديل في نفس النافذة)
- تحديث معلومات المتجر تلقائياً عند تسجيل الدخول/الخروج

```typescript
// مراقبة تغييرات localStorage
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'storeInfo' || e.key === 'storeId' || e.key === 'token') {
      updateStoreFromStorage();
    }
  };

  // مراقبة custom events
  const handleCustomStorageChange = () => {
    updateStoreFromStorage();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('storeDataUpdated', handleCustomStorageChange);
  window.addEventListener('userLoggedIn', handleCustomStorageChange);
  window.addEventListener('userLoggedOut', handleCustomStorageChange);
}, []);
```

### 2. تحديث useAuth

تم إضافة events عند تسجيل الدخول والخروج:

```typescript
// عند تسجيل الدخول
window.dispatchEvent(new CustomEvent('userLoggedIn', { 
  detail: { user: data.user, store: data.user.store } 
}));

// عند تسجيل الخروج
window.dispatchEvent(new CustomEvent('userLoggedOut'));
```

### 3. تحديث useLocalStorage

تم إضافة events عند تحديث بيانات المتجر:

```typescript
export const updateStoreData = (storeData: any) => {
  // ... حفظ البيانات
  window.dispatchEvent(new CustomEvent('storeDataUpdated', { 
    detail: { storeData } 
  }));
};
```

## كيفية عمل النظام الآن

### 1. تسجيل الدخول
1. المستخدم يسجل دخول
2. يتم حفظ بيانات المتجر في `localStorage`
3. يتم إرسال `userLoggedIn` event
4. `StoreContext` يستقبل الحدث ويحدث معلومات المتجر
5. يتم تحديث `storeSlug` تلقائياً

### 2. تسجيل الخروج
1. المستخدم يسجل خروج
2. يتم مسح بيانات المتجر من `localStorage`
3. يتم إرسال `userLoggedOut` event
4. `StoreContext` يستقبل الحدث ويمسح معلومات المتجر
5. يتم توجيه المستخدم لصفحة تسجيل الدخول

### 3. تبديل المتجر
1. المستخدم يسجل دخول بحساب تاجر آخر
2. يتم تحديث بيانات المتجر في `localStorage`
3. يتم إرسال `storeDataUpdated` event
4. `StoreContext` يحدث معلومات المتجر الجديد
5. يتم تحديث `storeSlug` للمتجر الجديد

## اختبار النظام

تم إضافة مكون `StoreDebugger` للاختبار:

```typescript
import StoreDebugger from '../../components/common/StoreDebugger';

// في الصفحة الرئيسية
<StoreDebugger />
```

هذا المكون يعرض:
- معلومات المستخدم الحالي
- معلومات المتجر الحالي
- الـ slug الحالي
- الـ URLs المُنشأة
- زر لتسجيل الخروج واختبار تبديل المتجر

## مثال على التبديل

### قبل التبديل:
```
User: John Doe (admin)
Store: MyStore
Slug: mystore
URL: /mystore/products
```

### بعد تسجيل الدخول بحساب تاجر آخر:
```
User: Jane Smith (admin)
Store: AnotherStore
Slug: anotherstore
URL: /anotherstore/products
```

## الفوائد

1. **تحديث تلقائي**: معلومات المتجر تتحدث تلقائياً عند تسجيل الدخول/الخروج
2. **مراقبة التغييرات**: النظام يراقب جميع التغييرات في `localStorage`
3. **أحداث مخصصة**: استخدام custom events للتواصل بين المكونات
4. **اختبار سهل**: مكون debug مدمج للاختبار
5. **أداء محسن**: تحديث فوري بدون إعادة تحميل الصفحة

## استكشاف الأخطاء

### إذا لم يتحدث المتجر:
1. تأكد من أن `StoreProvider` يغلف التطبيق
2. تحقق من events في console
3. تأكد من أن `localStorage` يحتوي على بيانات المتجر الصحيحة

### للتصحيح:
```typescript
// أضف هذا في أي مكون
import { useStoreContext } from '../contexts/StoreContext';

const { currentStore, storeSlug } = useStoreContext();
console.log('Current Store:', currentStore);
console.log('Store Slug:', storeSlug);
```

## الخطوات التالية

1. **اختبار النظام**: جرب تسجيل الدخول بحسابات مختلفة
2. **إزالة مكون الاختبار**: احذف `StoreDebugger` بعد التأكد من عمل النظام
3. **إضافة ميزات إضافية**: مثل تبديل المتجر بدون تسجيل خروج 