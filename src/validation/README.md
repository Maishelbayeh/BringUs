# Image Validation System

نظام validation شامل للصور في التطبيق مع حد أقصى 3 ميجابايت لكل صورة.

## الميزات

- ✅ حد أقصى 3 ميجابايت لكل صورة
- ✅ دعم أنواع الصور: JPG, JPEG, PNG, GIF, WebP
- ✅ دعم الترجمة (العربية والإنجليزية)
- ✅ validation للصور المفردة والمتعددة
- ✅ رسائل خطأ واضحة ومفيدة
- ✅ تكامل مع جميع النماذج في التطبيق

## الاستخدام

### 1. استخدام الدوال الأساسية

```typescript
import { validateImageFile, validateImageFiles } from '@/validation/imageValidation';

// للصورة الواحدة
const result = validateImageFile(file);
if (!result.isValid) {
  console.error(result.errorMessage);
}

// للصور المتعددة
const result = validateImageFiles(files);
if (!result.isValid) {
  console.error(result.errorMessage);
}
```

### 2. استخدام مع الترجمة

```typescript
import { validateImageFileI18n, validateImageFilesI18n } from '@/validation/imageValidation';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// للصورة الواحدة مع الترجمة
const result = validateImageFileI18n(file, t);

// للصور المتعددة مع الترجمة
const result = validateImageFilesI18n(files, t);
```

### 3. استخدام مع CustomFileInput

```typescript
import { createImageValidationFunction } from '@/validation/imageValidation';

const imageValidator = createImageValidationFunction(t);

<CustomFileInput
  label="الصورة"
  onChange={handleImageChange}
  beforeChangeValidate={imageValidator}
/>
```

## الخيارات المتاحة

```typescript
interface ImageValidationOptions {
  maxSizeMB?: number;        // الحد الأقصى بالميجابايت (افتراضي: 3)
  allowedTypes?: string[];   // أنواع الملفات المسموحة
  maxFiles?: number;         // الحد الأقصى لعدد الملفات (افتراضي: 10)
}
```

## رسائل الخطأ

### العربية
- `حجم الصورة {{size}} ميجابايت يتجاوز الحد المسموح ({{limit}} ميجابايت)`
- `الصور التالية تتجاوز الحد المسموح ({{limit}} ميجابايت): {{names}}`
- `عدد الملفات كبير جداً. الحد الأقصى المسموح: {{limit}}`
- `نوع الملف غير صحيح. الأنواع المسموحة: {{types}}`

### الإنجليزية
- `Image size {{size}} MB exceeds the allowed ({{limit}} MB)`
- `The following image exceed the allowed size ({{limit}} MB): {{names}}`
- `Too many files. Maximum allowed: {{limit}}`
- `Invalid file type. Allowed types: {{types}}`

## الملفات المحدثة

### ملفات Validation
- `src/validation/imageValidation.ts` - النظام الأساسي
- `src/validation/productValidation.ts` - إضافة validation للصور
- `src/validation/categoryValidation.ts` - إضافة validation للصور

### ملفات الترجمة
- `src/localization/ar.json` - رسائل الخطأ العربية
- `src/localization/en.json` - رسائل الخطأ الإنجليزية

### المكونات
- `src/components/common/CustomFileInput.tsx` - تحديث لدعم validation الجديد

### النماذج المحدثة
- `src/pages/products/ProductsForm.tsx`
- `src/pages/categories/components/CategoriesForm.tsx`
- `src/pages/subcategories/SubcategoriesForm.tsx`
- `src/pages/StoreSlider/componant/StoreSliderForm.tsx`
- `src/pages/Testimonials/TestimonialDrawer.tsx`
- `src/pages/Advertisement/AdvertisementForm.tsx`
- `src/pages/payment/componant/paymentForm.tsx`
- `src/pages/Login/NewUserRegistration.tsx`
- `src/pages/products/VariantEditDrawer.tsx`

## الاختبار

تم إنشاء ملفات اختبار شاملة في `src/validation/__tests__/imageValidation.test.ts` لضمان عمل النظام بشكل صحيح.

## الثوابت

```typescript
export const MAX_IMAGE_SIZE_MB = 3;
export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
```

## ملاحظات مهمة

1. **الحد الأقصى**: 3 ميجابايت لكل صورة
2. **الأنواع المدعومة**: JPG, JPEG, PNG, GIF, WebP
3. **الحد الأقصى للملفات**: 10 ملفات في المرة الواحدة
4. **الترجمة**: دعم كامل للعربية والإنجليزية
5. **التكامل**: يعمل مع جميع النماذج في التطبيق

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. تأكد من أن الملف من نوع صورة مدعوم
2. تأكد من أن حجم الملف لا يتجاوز 3 ميجابايت
3. تأكد من أن عدد الملفات لا يتجاوز 10 ملفات
4. تحقق من رسائل الخطأ المعروضة للمستخدم