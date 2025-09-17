# نظام تأكيد الإيميل - Email Verification System

## نظرة عامة
تم إنشاء نظام تأكيد الإيميل للمستخدمين الجدد عند التسجيل. النظام يتضمن:

1. **مكون OTPVerification**: واجهة المستخدم لإدخال رمز التحقق
2. **Hook useOTP**: للتعامل مع API الخاص بتأكيد الإيميل
3. **تكامل مع صفحة التسجيل**: عرض صفحة التأكيد بعد إنشاء المستخدم

## الملفات المُنشأة/المُحدثة

### 1. مكون OTPVerification
**الملف**: `src/components/Auth/OTPVerification.tsx`

**الميزات**:
- إدخال رمز تحقق مكون من 5 أرقام
- التنقل التلقائي بين الحقول
- دعم اللصق للرموز الكاملة
- زر إعادة الإرسال مع عداد زمني (60 ثانية)
- دعم اللغتين العربية والإنجليزية
- تصميم متجاوب

**الاستخدام**:
```tsx
<OTPVerification
  email="user@example.com"
  onVerificationSuccess={() => console.log('تم التحقق بنجاح')}
  onResendCode={() => console.log('تم إعادة الإرسال')}
  onBack={() => console.log('العودة')}
/>
```

### 2. Hook useOTP
**الملف**: `src/hooks/useOTP.ts`

**الوظائف**:
- `sendOTP(email, storeSlug)`: إرسال رمز التحقق
- `verifyOTP(email, otp)`: التحقق من الرمز
- `resendOTP(email, storeSlug)`: إعادة إرسال الرمز
- `reset()`: إعادة تعيين الحالة

**الاستخدام**:
```tsx
const { sendOTP, verifyOTP, resendOTP, loading, error } = useOTP();
```

### 3. تحديث صفحة التسجيل
**الملف**: `src/pages/Login/NewUserRegistration.tsx`

**التحديثات**:
- إضافة state للتحكم في عرض صفحة OTP
- تحديث دالة `handleSubmit` لإرسال OTP بعد إنشاء المستخدم
- إضافة دوال معالجة OTP
- عرض صفحة OTP عند الحاجة

### 4. الترجمات
**الملفات**: 
- `src/localization/ar.json`
- `src/localization/en.json`

**المفاتيح المضافة**:
```json
{
  "auth": {
    "otp": {
      "title": "تأكيد البريد الإلكتروني",
      "subtitle": "تم إرسال رمز التحقق إلى",
      "verification_code": "رمز التحقق",
      "enter_code": "أدخل الرمز المكون من 5 أرقام",
      "verify": "تحقق من الرمز",
      "verifying": "جاري التحقق...",
      "didnt_receive": "لم تستلم الرمز؟",
      "resend_code": "إعادة إرسال الرمز",
      "sending": "جاري الإرسال...",
      "resend_in": "إعادة الإرسال خلال {{seconds}} ثانية",
      "wrong_email": "البريد الإلكتروني خاطئ؟",
      "change_email": "تغيير البريد الإلكتروني"
    }
  }
}
```

## تدفق العمل (Workflow)

1. **تسجيل المستخدم**: المستخدم يملأ نموذج التسجيل
2. **إنشاء الحساب**: يتم إنشاء الحساب في قاعدة البيانات
3. **إرسال OTP**: يتم إرسال رمز التحقق إلى الإيميل
4. **عرض صفحة OTP**: يتم عرض صفحة إدخال الرمز
5. **التحقق من الرمز**: المستخدم يدخل الرمز المرسل
6. **إكمال التسجيل**: عند نجاح التحقق، يتم إكمال العملية

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

### تغيير عدد أرقام OTP
لتغيير عدد الأرقام من 5 إلى رقم آخر، قم بتعديل:

1. في `OTPVerification.tsx`:
```tsx
const [otp, setOtp] = useState(['', '', '', '', '']); // غيّر عدد العناصر
```

2. في `useOTP.ts`:
```tsx
// تأكد من أن الباك إند يدعم العدد الجديد
```

### تغيير مدة عداد الإعادة
```tsx
const [countdown, setCountdown] = useState(60); // غيّر القيمة بالثواني
```

### تخصيص التصميم
يمكنك تخصيص التصميم من خلال تعديل classes CSS في مكون `OTPVerification`.

## الأمان

- الرموز صالحة لمدة 15 دقيقة (قابلة للتخصيص في الباك إند)
- عداد زمني لمنع إعادة الإرسال المتكرر
- التحقق من صحة الإدخال (أرقام فقط)
- معالجة الأخطاء بشكل آمن

## الاختبار

لاختبار النظام:

1. قم بتسجيل مستخدم جديد
2. تحقق من وصول الإيميل
3. أدخل الرمز في صفحة OTP
4. تأكد من نجاح التحقق
5. اختبر إعادة الإرسال

## استكشاف الأخطاء

### مشاكل شائعة:

1. **لا يصل الإيميل**: تحقق من إعدادات SMTP في الباك إند
2. **فشل التحقق**: تأكد من صحة الرمز المدخل
3. **خطأ في API**: تحقق من endpoints في الباك إند
4. **مشاكل الترجمة**: تأكد من وجود المفاتيح في ملفات الترجمة

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
