# إصلاح مشكلة تحديث الوحدة في المنتجات

## المشكلة

كانت هناك مشكلة في تحديث قيمة الوحدة عند تعديل المنتج. المشكلة كانت كالتالي:

1. **عدم تطابق أسماء الحقول**: النموذج كان يستخدم `unit` بينما التحقق من الصحة يتوقع `unitId`
2. **عدم تحديث الحقلين معاً**: عند تغيير الوحدة، كان يتم تحديث `unit` فقط وليس `unitId`
3. **أولوية خاطئة في الإرسال**: دالة `handleSubmit` كانت تبحث عن `form.unitId || form.unit` مما يعني أن `unitId` له أولوية أعلى

## التفاصيل التقنية

### المشكلة الأصلية

```typescript
// في ProductsForm.tsx
handleSelectChange('unit', e.target.value); // يحدث form.unit فقط

// في products.tsx handleSubmit
unitId: form.unitId || form.unit || null, // يبحث عن unitId أولاً
```

### الحل المطبق

#### 1. تحديث ProductsForm.tsx

```typescript
const handleSelectChange = (name: string, value: string) => {
  // ... التحقق من الصحة ...
  
  // تحديث الحقل المطلوب
  onFormChange({
    target: { name, value }
  } as any);
  
  // تحديث unitId أيضاً عندما يتم تغيير unit
  if (name === 'unit') {
    onFormChange({
      target: { name: 'unitId', value }
    } as any);
    
    // التحقق من صحة unitId أيضاً
    if (showValidation) {
      clearError('unitId');
      const fieldError = validateField('unitId', value);
      if (onFieldValidation) {
        onFieldValidation('unitId', value);
      }
    }
  }
};
```

#### 2. تحديث products.tsx

```typescript
const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  // ... معالجة الحقول الأخرى ...
  
  if (e.target.name === 'unitId') {
    // تحديث unitId و unit معاً
    const newForm = { ...form, unitId: e.target.value, unit: e.target.value };
    setForm(newForm);
  } else if (e.target.name === 'unit') {
    // تحديث unit و unitId معاً
    const newForm = { ...form, unit: e.target.value, unitId: e.target.value };
    setForm(newForm);
  } else {
    // التعامل مع الحقول الأخرى
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
  }
};
```

#### 3. تصحيح أسماء الحقول في التحقق من الصحة

```typescript
// في ProductsForm.tsx
<CustomSelect
  label={isRTL ? t('products.unit') : 'Unit'}
  value={typeof form.unit === 'object' && form.unit && form.unit._id ? form.unit._id : (form.unit || '')}
  onChange={(e) => handleSelectChange('unit', e.target.value)}
  className={getFieldErrorClass('unitId')} // تم تغييرها من 'unit' إلى 'unitId'
  options={[...]}
/>
{renderFieldError('unitId')} // تم تغييرها من 'units' إلى 'unitId'
```

## الاختبار

تم إنشاء مكون اختبار `UnitSelectionTest` للتحقق من صحة الإصلاح:

```typescript
// src/components/examples/UnitSelectionTest.tsx
const UnitSelectionTest: React.FC = () => {
  // يختبر أن تحديث الوحدة يحدث كل من unit و unitId
  // ويتحقق من تطابق القيم عند الإرسال
};
```

## النتيجة

بعد تطبيق الإصلاح:

1. ✅ عند تغيير الوحدة، يتم تحديث كل من `unit` و `unitId`
2. ✅ التحقق من الصحة يعمل بشكل صحيح مع `unitId`
3. ✅ عند الإرسال، يتم استخدام القيمة الصحيحة للوحدة
4. ✅ لا توجد مشكلة في التحديث عند تعديل المنتج

## الملفات المعدلة

1. `src/pages/products/ProductsForm.tsx` - تحديث `handleSelectChange`
2. `src/pages/products/products.tsx` - تحديث `handleFormChange`
3. `src/components/examples/UnitSelectionTest.tsx` - مكون اختبار جديد
4. `src/components/examples/index.ts` - إضافة التصدير الجديد

## كيفية الاستخدام

1. افتح صفحة المنتجات
2. اضغط على "تعديل" لأي منتج
3. غير الوحدة
4. اضغط "حفظ"
5. تحقق من أن الوحدة الجديدة تم حفظها بشكل صحيح 