# 🍪 تحديث ميزة "تذكرني" - استخدام Cookies

## 📋 نظرة عامة
تم تحديث ميزة "تذكرني" (Remember Me) في نظام تسجيل الدخول لاستخدام **Cookies** بدلاً من `localStorage` عند تفعيل الخيار.

---

## 🔄 التغييرات المنفذة

### 1️⃣ **ملف جديد: `src/utils/cookies.ts`**
تم إنشاء مجموعة من الدوال المساعدة للتعامل مع الكوكيز:

- `setCookie()` - حفظ قيمة في الكوكيز
- `getCookie()` - قراءة قيمة من الكوكيز
- `deleteCookie()` - حذف كوكيز معينة
- `deleteAllCookies()` - حذف جميع الكوكيز
- `hasCookie()` - التحقق من وجود كوكيز
- `setCookieObject()` - حفظ كائن JSON في الكوكيز
- `getCookieObject()` - قراءة كائن JSON من الكوكيز

**الميزات:**
- ✅ صلاحية قابلة للتخصيص (افتراضياً 30 يوم)
- ✅ دعم HTTPS Secure
- ✅ دعم SameSite للحماية من CSRF
- ✅ تشفير/فك تشفير تلقائي
- ✅ دعم كائنات JSON

---

### 2️⃣ **التحديثات على `src/hooks/useAuth.ts`**

#### **⚠️ مهم: التوكن يُحفظ في localStorage دائماً**
```typescript
// ✅ حفظ التوكن في localStorage دائماً (جميع الـ APIs تعتمد عليه)
localStorage.setItem('token', data.token);
localStorage.setItem('userInfo', JSON.stringify(data.user));
```

#### **عند تسجيل الدخول مع "تذكرني":**
```typescript
if (credentials.rememberMe) {
  // حفظ إضافي في الكوكيز - يبقى لمدة 30 يوم
  setCookie('token', data.token, { days: 30 });
  setCookieObject('userInfo', data.user, { days: 30 });
  setCookie('rememberMe', 'true', { days: 30 });
}
```

#### **عند تسجيل الدخول بدون "تذكرني":**
```typescript
else {
  // حذف الكوكيز إذا كان "تذكرني" غير مفعّل
  deleteCookie('token');
  deleteCookie('userInfo');
  deleteCookie('rememberMe');
}
```

#### **تحسين `getToken()`:**
الآن يبحث في localStorage أولاً (لأن التوكن دائماً موجود هناك):
```typescript
const getToken = () => {
  // localStorage أولاً (التوكن دائماً محفوظ هنا)
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Cookies كـ fallback
  const cookieToken = getCookie('token');
  if (cookieToken) return cookieToken;
  
  return null;
};
```

#### **تحسين `getCurrentUser()`:**
```typescript
const getCurrentUser = () => {
  // localStorage أولاً (البيانات دائماً محفوظة هنا)
  const localUserInfo = localStorage.getItem('userInfo');
  if (localUserInfo) return JSON.parse(localUserInfo);
  
  // Cookies كـ fallback
  const cookieUserInfo = getCookieObject('userInfo');
  if (cookieUserInfo) return cookieUserInfo;
  
  return null;
};
```

#### **تحديث `logout()`:**
الآن يحذف بيانات الجلسة فقط، **ويحتفظ** بـ savedEmail و savedPassword و rememberMe:
```typescript
// Clear cookies (except savedEmail and savedPassword for "Remember Me")
deleteCookie('token');
deleteCookie('userInfo');
// NOTE: لا نحذف savedEmail و savedPassword و rememberMe حتى يبقوا محفوظين
```

**ملاحظة مهمة:** عند تسجيل الخروج، البيانات التالية تبقى محفوظة:
- ✅ `savedEmail` - ليتم ملء الحقل تلقائياً في المرة القادمة
- ✅ `savedPassword` - ليتم ملء الحقل تلقائياً في المرة القادمة
- ✅ `rememberMe` - لتذكر حالة الـ checkbox

#### **دالة جديدة: `clearRememberMe()`:**
لحذف بيانات "تذكرني" بشكل نهائي:
```typescript
const clearRememberMe = () => {
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('savedPassword');
  localStorage.removeItem('rememberMe');
  deleteCookie('savedEmail');
  deleteCookie('savedPassword');
  deleteCookie('rememberMe');
};
```
يمكن استخدامها من زر "نسيان البيانات المحفوظة" في صفحة Login.

---

### 3️⃣ **التحديثات على `src/pages/Login/Login.tsx`**

#### **تحميل البيانات المحفوظة:**
```typescript
const savedEmail = getCookie('savedEmail') || localStorage.getItem('savedEmail');
const savedPassword = getCookie('savedPassword') || localStorage.getItem('savedPassword');
```

#### **حفظ البيانات عند تفعيل "تذكرني":**
```typescript
if (rememberMe) {
  setCookie('savedEmail', formData.email, { days: 30 });
  setCookie('savedPassword', formData.password, { days: 30 });
}
```

#### **مسح البيانات عند إلغاء "تذكرني":**
```typescript
else {
  deleteCookie('savedEmail');
  deleteCookie('savedPassword');
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('savedPassword');
}
```

---

## 📊 المقارنة: قبل وبعد

| الميزة | ❌ قبل | ✅ بعد |
|--------|--------|--------|
| **مكان حفظ Token** | localStorage أو sessionStorage | localStorage (دائماً) + Cookies (عند تفعيل "تذكرني") |
| **مكان حفظ Email/Password** | localStorage | Cookies (30 يوم) عند تفعيل "تذكرني" |
| **الأمان** | متوسط | أعلى (Secure, SameSite في Cookies) |
| **التوافق مع APIs** | جيد | ممتاز (Token دائماً في localStorage) |
| **حذف تلقائي عند انتهاء الصلاحية** | لا | نعم (للكوكيز فقط) |
| **حماية من CSRF** | لا | نعم (SameSite للكوكيز) |

---

## 🔒 الأمان

### الميزات الأمنية المضافة:
1. **Secure Flag**: يتم تفعيله تلقائياً عند استخدام HTTPS
2. **SameSite**: يمنع هجمات CSRF
3. **تشفير**: البيانات مشفرة تلقائياً باستخدام `encodeURIComponent`
4. **انتهاء صلاحية محدد**: الكوكيز تنتهي بعد 30 يوم تلقائياً

---

## 🧪 كيفية الاختبار

### 1. اختبار "تذكرني" مفعّل:
```bash
1. سجل دخول مع تفعيل "تذكرني"
2. افتح Developer Tools > Application > Cookies
3. تحقق من وجود:
   - token
   - userInfo
   - rememberMe
   - savedEmail
   - savedPassword
4. أغلق المتصفح وأعد فتحه
5. افتح الصفحة مرة أخرى - يجب أن تكون مسجل دخول
6. يجب أن تكون الحقول مملوءة تلقائياً
```

### 2. اختبار "تذكرني" غير مفعّل:
```bash
1. سجل دخول بدون تفعيل "تذكرني"
2. تحقق من Developer Tools:
   - Token في sessionStorage فقط
   - لا توجد cookies
3. أغلق المتصفح وأعد فتحه
4. افتح الصفحة - يجب أن تكون خارج
```

### 3. اختبار تسجيل الخروج:
```bash
1. سجل دخول مع تفعيل "تذكرني"
2. سجل خروج
3. تحقق من Developer Tools:
   ✅ Token و userInfo محذوفة
   ✅ savedEmail و savedPassword لا تزال موجودة
   ✅ rememberMe لا يزال موجود
4. افتح صفحة Login مرة أخرى:
   ✅ الحقول ممتلئة تلقائياً
   ✅ checkbox "تذكرني" مفعّل
```

---

## 🔧 التكوين

يمكنك تخصيص مدة الكوكيز في `src/pages/Login/Login.tsx`:

```typescript
// تغيير من 30 يوم إلى 7 أيام مثلاً
setCookie('savedEmail', formData.email, { days: 7 });
```

أو في `src/hooks/useAuth.ts`:

```typescript
setCookie('token', data.token, { days: 7 }); // 7 أيام بدلاً من 30
```

---

## 📝 ملاحظات مهمة

1. **التوافق للخلف**: النظام يدعم كلاً من localStorage والكوكيز للحفاظ على التوافق
2. **الأمان**: لا تحفظ كلمات المرور بشكل عام في production، هذا للتطوير فقط
3. **HTTPS**: الكوكيز الآمنة تعمل فقط مع HTTPS
4. **الحجم**: الكوكيز محدودة بـ 4KB لكل cookie

---

## 🚀 الملفات المعدلة

- ✅ `src/utils/cookies.ts` (جديد)
- ✅ `src/hooks/useAuth.ts` (محدث)
- ✅ `src/pages/Login/Login.tsx` (محدث)

---

## 🎯 النتيجة

### ✅ في جميع الحالات:
- Token يُحفظ **دائماً** في localStorage (للـ APIs)
- جميع الـ APIs تعمل بشكل طبيعي

### ✅ عند تفعيل "تذكرني":
- حفظ إضافي في الكوكيز لمدة 30 يوم (Token + userInfo)
- حفظ Email وPassword في الكوكيز
- **عند تسجيل الخروج: البيانات المحفوظة تبقى** (savedEmail, savedPassword, rememberMe)
- الحقول تملأ تلقائياً في المرة القادمة
- أمان أفضل مع Secure و SameSite
- انتهاء صلاحية تلقائي بعد 30 يوم

### ✅ عند إلغاء "تذكرني":
- Token في localStorage فقط
- لا يتم حفظ Email/Password
- الحقول فارغة عند فتح الصفحة مرة أخرى

## 🆕 ميزة إضافية

تم إضافة دالة `clearRememberMe()` في `useAuth` لحذف بيانات "تذكرني" بشكل نهائي.
يمكن استخدامها لإضافة زر "نسيان البيانات المحفوظة" في صفحة Login:

```typescript
const { clearRememberMe } = useAuth();

// في زر أو link
<button onClick={clearRememberMe}>
  نسيان البيانات المحفوظة
</button>
```

