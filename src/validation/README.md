# نظام الفالديشين العام للمشروع

## نظرة عامة

هذا نظام فالديشين شامل وقابل لإعادة الاستخدام عبر المشروع بأكمله، يلغي الحاجة لتكرار كود الفالديشين في كل فورم منفرد.

## المكونات الأساسية

### 1. ملف الأدوات العامة (`src/utils/validation.ts`)
يحتوي على:
- دوال الفالديشين الأساسية
- Patterns للتعبيرات النمطية المختلفة
- Schemas جاهزة للاستخدام المتكرر
- Types للـ TypeScript

### 2. Hook مخصص (`src/hooks/useValidation.ts`)
يحتوي على:
- `useValidation` - Hook شامل للفالديشين
- `useSimpleValidation` - Hook مبسط للفالديشين السريع
- `useAdvancedValidation` - Hook متقدم مع قواعد مخصصة

### 3. ملفات الفالديشين المخصصة (`src/validation/`)
ملفات منفصلة لكل نوع فورم (مثل: `deliveryValidation.ts`, `paymentValidation.ts`)

## كيفية الاستخدام

### الطريقة الأساسية

```typescript
import { useValidation } from '../hooks/useValidation';
import { deliveryValidationSchema } from '../validation/deliveryValidation';

const MyForm = () => {
  const {
    errors,
    validateForm,
    validateField,
    clearError,
  } = useValidation({
    schema: deliveryValidationSchema,
    onValidationChange: (isValid) => console.log('Form valid:', isValid),
  });

  const handleSubmit = () => {
    const formData = { /* بيانات الفورم */ };
    const result = validateForm(formData);
    
    if (result.isValid) {
      // إرسال البيانات
    }
  };

  return (
    <form>
      <input 
        onChange={(e) => {
          // تنظيف الخطأ عند الكتابة
          clearError('fieldName');
        }}
      />
      {errors.fieldName && <span>{errors.fieldName}</span>}
    </form>
  );
};
```

### الطريقة المبسطة

```typescript
import { useSimpleValidation } from '../hooks/useValidation';

const SimpleForm = () => {
  const { validateRequired, validateEmail, validateMinLength } = useSimpleValidation();
  
  const checkField = (value) => {
    const error = validateRequired(value) || 
                  validateMinLength(value, 3) || 
                  validateEmail(value);
    return error;
  };
};
```

### إنشاء Schema جديد

```typescript
// src/validation/myFormValidation.ts
import { ValidationSchema, COMMON_SCHEMAS } from '../utils/validation';

export const myFormSchema: ValidationSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
  },
  email: {
    required: true,
    type: 'email',
  },
  price: {
    required: true,
    type: 'number',
    min: 0,
    max: 1000,
  },
  // استخدام Schema جاهز
  ...COMMON_SCHEMAS.bilingualText(2, 100),
};
```

## أنواع الفالديشين المتاحة

### الأنواع الأساسية
- `string` - نص عادي
- `number` - رقم
- `email` - بريد إلكتروني
- `phone` - رقم هاتف (يجب أن يبدأ بـ + ورمز الدولة، حد أقصى 15 رقم)
- `arabicText` - نص عربي فقط
- `englishText` - نص إنجليزي مع أرقام ورموز عادية
- `url` - رابط
- `file` - ملف

### قواعد الهاتف والواتساب
- **يجب البدء بـ +** متبوعاً برمز الدولة
- **رمز الدولة** يجب أن يبدأ برقم من 1-9 (أي دولة في العالم)
- **الحد الأقصى للطول** 15 رقم إجمالي (شامل رمز الدولة)
- **أمثلة صحيحة:**
  - `+970591234567` (فلسطين)
  - `+972594056090` (إسرائيل) 
  - `+12125551234` (أمريكا)
  - `+441234567890` (بريطانيا)
  - `+966501234567` (السعودية)
  - `+201234567890` (مصر)
  - `+33123456789` (فرنسا)
- **أمثلة خاطئة:**
  - `0591234567` (لا يبدأ بـ +)
  - `970591234567` (لا يبدأ بـ +)
  - `+0591234567` (رمز الدولة يبدأ بصفر)
  - `+9725940560901234` (أكثر من 15 رقم)

### قواعد النص الإنجليزي
النص الإنجليزي يقبل الآن:
- **الأحرف الإنجليزية** (A-Z, a-z)
- **الأرقام** (0-9)  
- **المسافات**
- **الرموز العادية:** `. , : ; ! ? ( ) ' " & @ # $ % * + = / \ [ ] { } | < > ~ ` ^ -`

**أمثلة صحيحة:**
- `Product Name 123`
- `Email: user@example.com`
- `Price: $99.99 (50% off!)`
- `Description with symbols: #product & features`

**أمثلة خاطئة:**
- `اسم المنتج` (نص عربي)
- `Продукт` (نص روسي)
- `Название` (أحرف غير مدعومة)

### القواعد المتاحة
- `required` - مطلوب
- `minLength` - أقل عدد أحرف
- `maxLength` - أقصى عدد أحرف
- `min` - أقل قيمة رقمية
- `max` - أقصى قيمة رقمية
- `pattern` - تعبير نمطي مخصص
- `custom` - دالة فالديشين مخصصة

## Schemas الجاهزة

### النصوص ثنائية اللغة
```typescript
import { COMMON_SCHEMAS } from '../utils/validation';

const schema = {
  ...COMMON_SCHEMAS.bilingualText(2, 100), // min, max length
};
```

### السعر
```typescript
const schema = {
  ...COMMON_SCHEMAS.price(0, 1000, false), // min, max, allowZero
};
```

### معلومات الاتصال
```typescript
const schema = {
  ...COMMON_SCHEMAS.contact(),
};
```

### تسجيل المستخدم
```typescript
const schema = {
  ...COMMON_SCHEMAS.userRegistration(),
};
```

## الدوال المساعدة

### التحقق من عدم التكرار
```typescript
const { validateUnique } = useValidation({ schema });

const error = validateUnique(
  value,           // القيمة المراد فحصها
  existingItems,   // المصفوفة الموجودة
  'fieldName',     // اسم الحقل
  currentId        // معرف العنصر الحالي (للتعديل)
);
```

### التحقق من تطابق كلمات المرور
```typescript
const { validatePasswordMatch } = useValidation({ schema });

const error = validatePasswordMatch(password, confirmPassword);
```

### التحقق من رقم الواتساب
```typescript
const { validateWhatsApp } = useValidation({ schema });

const error = validateWhatsApp(phoneNumber);
// يجب أن يبدأ الرقم بـ + ويتبعه رمز الدولة
// مثال: +970591234567 أو +972501234567
// الحد الأقصى 15 رقم إجمالي
```

## الميزات المتقدمة

### فالديشين فوري
```typescript
const validation = useValidation({
  schema,
  validateOnChange: true,  // فالديشين عند الكتابة
  validateOnBlur: true,    // فالديشين عند فقدان التركيز
});
```

### فالديشين مخصص
```typescript
const customSchema = {
  customField: {
    required: true,
    custom: (value) => {
      // منطق فالديشين مخصص
      return value.includes('test');
    }
  }
};
```

## إدارة الأخطاء

```typescript
const {
  errors,           // جميع الأخطاء
  hasError,         // فحص وجود خطأ
  clearError,       // مسح خطأ واحد
  clearAllErrors,   // مسح جميع الأخطاء
  setError,         // تعيين خطأ مخصص
} = useValidation({ schema });

// فحص وجود خطأ
if (hasError('fieldName')) {
  // معالجة الخطأ
}

// مسح خطأ معين
clearError('fieldName');

// تعيين خطأ مخصص
setError('fieldName', 'رسالة خطأ مخصصة');
```

## أمثلة عملية

### مثال 1: فورم التوصيل
```typescript
// src/validation/deliveryValidation.ts
export const deliverySchema = {
  locationAr: {
    required: true,
    type: 'arabicText',
    minLength: 2,
    maxLength: 50,
  },
  locationEn: {
    required: true,
    type: 'englishText',
    minLength: 2,
    maxLength: 50,
  },
  price: {
    required: true,
    type: 'number',
    min: 0,
    max: 10000,
    custom: (value) => value > 0,
  },
};

// في الكومبوننت
const { errors, validateForm, clearError } = useValidation({
  schema: deliverySchema,
});
```

### مثال 2: فورم المنتج
```typescript
const productSchema = {
  ...COMMON_SCHEMAS.bilingualText(2, 200), // nameAr, nameEn
  ...COMMON_SCHEMAS.price(0, 1000000, false),
  description: {
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 1000,
  },
};
```

## نصائح مهمة

1. **استخدم Schemas الجاهزة** قدر الإمكان لتوفير الوقت
2. **ضع ملفات الفالديشين المخصصة** في مجلد `src/validation/`
3. **استخدم TypeScript interfaces** لضمان سلامة الأنواع
4. **اختبر الفالديشين** مع بيانات مختلفة
5. **استخدم رسائل الترجمة** للدعم متعدد اللغات

## الترجمة

جميع رسائل الخطأ تدعم الترجمة عبر i18next:

```json
// en.json
{
  "validation": {
    "required": "This field is required",
    "minLength": "Minimum length is {{min}} characters"
  }
}

// ar.json
{
  "validation": {
    "required": "هذا الحقل مطلوب",
    "minLength": "الحد الأدنى للطول هو {{min}} أحرف"
  }
}
```

## 📝 **مثال شامل: فالديشين الكاتيجوريز**

```typescript
// استخدام فالديشين الكاتيجوريز مع النظام العام
import { useValidation } from '../hooks/useValidation';
import { categoryValidationSchema, CategoryFormData } from '../validation/categoryValidation';

const CategoriesDrawer = () => {
  const { 
    errors, 
    validateForm, 
    validateUnique,
    clearAllErrors 
  } = useValidation({
    schema: categoryValidationSchema
  });

  const handleSave = async (form: any, existingCategories: any[], currentId?: string) => {
    // تحضير البيانات للفالديشين
    const formData: CategoryFormData = {
      nameAr: form.nameAr || '',
      nameEn: form.nameEn || '',
      descriptionAr: form.descriptionAr,
      descriptionEn: form.descriptionEn,
      image: form.image,
      order: form.order ? parseInt(form.order) : undefined,
    };

    // فالديشين البيانات الأساسية
    const validation = validateForm(formData);
    if (!validation.isValid) {
      showError('يرجى تصحيح الأخطاء في الفورم');
      return;
    }

    // فالديشين عدم التكرار للأسماء
    const nameArExists = validateUnique(formData.nameAr, existingCategories, 'nameAr', currentId);
    const nameEnExists = validateUnique(formData.nameEn, existingCategories, 'nameEn', currentId);
    
    if (nameArExists || nameEnExists) {
      showError('الاسم موجود مسبقاً');
      return;
    }

    // حفظ البيانات
    await saveCategory(formData);
    clearAllErrors();
  };

  return (
    <form>
      <CustomInput 
        name="nameAr" 
        error={errors.nameAr}
        placeholder="اسم الفئة بالعربية"
      />
      <CustomInput 
        name="nameEn" 
        error={errors.nameEn}
        placeholder="Category name in English"
      />
      {/* باقي الحقول */}
    </form>
  );
};
```

هذا المثال يوضح كيفية:
- ✅ استخدام Schema جاهز للكاتيجوريز
- ✅ التحقق من الفالديشين الأساسي
- ✅ التحقق من عدم تكرار الأسماء
- ✅ عرض الأخطاء في الـ UI
- ✅ مسح الأخطاء بعد النجاح