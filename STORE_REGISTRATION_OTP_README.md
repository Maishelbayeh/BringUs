# تحديث نظام تأكيد الإيميل في StoreRegistrationWizard

## نظرة عامة
تم تحديث `StoreRegistrationWizard` لإضافة تأكيد الإيميل بعد إنشاء المستخدم والمالك في الخطوة 2. الآن بعد إنشاء المتجر والمستخدم والمالك، سيتم إرسال رمز تحقق إلى إيميل المستخدم قبل إكمال عملية التسجيل.

## التحديثات المُطبقة

### 1. إضافة الـ Imports المطلوبة
```tsx
import OTPVerification from '../../components/Auth/OTPVerification';
import useOTP from '../../hooks/useOTP';
```

### 2. إضافة الـ State الجديد
```tsx
// إضافة state للتحكم في OTP
const [showOTP, setShowOTP] = useState(false);
const [registrationData, setRegistrationData] = useState<any>(null);
```

### 3. إضافة معالجات OTP
```tsx
// معالجة نجاح التحقق من OTP
const handleOTPSuccess = () => {
  console.log('✅ تم التحقق من الإيميل بنجاح');
  alert('تم التسجيل بنجاح!');
  
  // إغلاق الويزرد
  onClose();
  
  // إعادة تعيين البيانات
  resetWizardData();
};

// معالجة إعادة إرسال OTP
const handleOTPResend = () => {
  console.log('📧 تم إعادة إرسال OTP');
  alert('تم إرسال رمز التحقق مرة أخرى');
};

// معالجة العودة من صفحة OTP
const handleOTPBack = () => {
  setShowOTP(false);
  if (registrationData) {
    console.log('العودة من OTP - بيانات التسجيل:', registrationData);
  }
  setRegistrationData(null);
};
```

### 4. تحديث دالة إنشاء المستخدم والمالك
تم تحديث دالة `handleMerchantSubmit` لتشمل:

```tsx
// حفظ بيانات التسجيل
setRegistrationData({ user, store, owner });

// إرسال OTP للتحقق من الإيميل
try {
  const storeSlug = store.slug || (store as any).name?.toLowerCase().replace(/\s+/g, '-') || 'default';
  const otpResult = await sendOTP(merchantData.email, storeSlug);
  
  if (otpResult.success) {
    console.log('📧 تم إرسال OTP بنجاح');
    setShowOTP(true);
  } else {
    console.log('❌ فشل في إرسال OTP:', otpResult.error);
    alert('تم التسجيل بنجاح! لكن فشل في إرسال رمز التحقق. يمكنك تسجيل الدخول مباشرة.');
    
    // إغلاق الويزرد
    onClose();
    resetWizardData();
  }
} catch (otpError) {
  console.error('💥 خطأ في إرسال OTP:', otpError);
  alert('تم التسجيل بنجاح! لكن فشل في إرسال رمز التحقق. يمكنك تسجيل الدخول مباشرة.');
  
  // إغلاق الويزرد
  onClose();
  resetWizardData();
}
```

### 5. إضافة عرض صفحة OTP
```tsx
{showOTP ? (
  // OTP Verification Step
  <OTPVerification
    email={merchantData.email}
    onVerificationSuccess={handleOTPSuccess}
    onResendCode={handleOTPResend}
    onBack={handleOTPBack}
  />
) : currentStep === 1 ? (
  // Step 1: Store Registration
  // ...
) : (
  // Step 2: Merchant Registration
  // ...
)}
```

## تدفق العمل الجديد

1. **الخطوة 1**: إنشاء المتجر
2. **الخطوة 2**: إنشاء المستخدم والمالك
3. **إرسال OTP**: بعد نجاح إنشاء المستخدم والمالك
4. **عرض صفحة OTP**: للمستخدم لإدخال رمز التحقق
5. **التحقق من OTP**: عند نجاح التحقق، يتم إكمال التسجيل
6. **إغلاق الويزرد**: وإعادة تعيين البيانات

## الميزات الجديدة

### ✅ معالجة الأخطاء
- في حالة فشل إرسال OTP، يتم إكمال التسجيل مع رسالة تنبيه
- المستخدم يمكنه تسجيل الدخول مباشرة حتى لو فشل إرسال OTP

### ✅ تجربة مستخدم محسنة
- عرض صفحة OTP جميلة ومتجاوبة
- دعم اللغتين العربية والإنجليزية
- إمكانية العودة من صفحة OTP
- إعادة إرسال الرمز مع عداد زمني

### ✅ حفظ البيانات
- حفظ بيانات التسجيل (المستخدم، المتجر، المالك) في state
- إمكانية الوصول للبيانات عند العودة من OTP

## API Endpoints المطلوبة

يجب أن يكون لديك endpoints التالية في الباك إند:

### 1. إرسال OTP
```
POST /api/email-verification/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "storeSlug": "my-store"
}
```

### 2. التحقق من OTP
```
POST /api/email-verification/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "otp": "12345"
}
```

### 3. إعادة إرسال OTP
```
POST /api/email-verification/resend
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "storeSlug": "my-store"
}
```

## التخصيص

### تغيير storeSlug
يمكنك تخصيص كيفية إنشاء storeSlug:

```tsx
const storeSlug = store.slug || 
  (store as any).name?.toLowerCase().replace(/\s+/g, '-') || 
  'default';
```

### تخصيص الرسائل
يمكنك تخصيص الرسائل في معالجات OTP:

```tsx
const handleOTPSuccess = () => {
  // رسالة مخصصة
  alert('مرحباً بك! تم التحقق من إيميلك بنجاح');
  
  // إجراءات إضافية
  // ...
};
```

## الاختبار

لاختبار النظام:

1. افتح StoreRegistrationWizard
2. أكمل الخطوة 1 (إنشاء المتجر)
3. أكمل الخطوة 2 (إنشاء المستخدم والمالك)
4. تحقق من وصول الإيميل
5. أدخل الرمز في صفحة OTP
6. تأكد من نجاح التحقق وإغلاق الويزرد

## استكشاف الأخطاء

### مشاكل شائعة:

1. **لا يصل الإيميل**: تحقق من إعدادات SMTP في الباك إند
2. **فشل في إنشاء storeSlug**: تحقق من وجود slug أو name في بيانات المتجر
3. **خطأ في API**: تأكد من وجود endpoints المطلوبة
4. **مشاكل الترجمة**: تأكد من وجود مفاتيح OTP في ملفات الترجمة

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
