# Store Registration Wizard - Email Validation
## معالج تسجيل المتجر - التحقق من البريد الإلكتروني

---

## 🎯 How Email Validation Works / كيف يعمل التحقق من البريد الإلكتروني

In `StoreRegistrationWizard.tsx`, email validation uses the **NEW API endpoint** `/api/auth/check-email`.

في `StoreRegistrationWizard.tsx`، التحقق من البريد الإلكتروني يستخدم **API الجديد** `/api/auth/check-email`.

---

## 📝 Implementation Details / تفاصيل التنفيذ

### Before ❌ (OLD Method)

```typescript
const { checkEmailExists } = useUser();

// Check email
const emailExists = await checkEmailExists(value);
```

**Problems:**
- ❌ Client-side check only
- ❌ Fetches ALL users first (expensive)
- ❌ Only checks current store users
- ❌ Not scalable

### After ✅ (NEW Method - API)

```typescript
// Real-time email check using API
if (name === 'email' && value && !error) {
  const timeoutId = setTimeout(async () => {
    if (value && /\S+@\S+\.\S+/.test(value)) {
      setIsCheckingEmail(true);
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://bringus-backend.onrender.com/api';
        
        const response = await fetch(`${apiUrl}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: value,
            storeSlug: '' // Empty for store registration (check globally)
          })
        });

        const data = await response.json();

        if (response.ok && data.available !== false) {
          // ✅ Email is available
          console.log('✅ Email is available');
          setMerchantErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        } else if (!data.available || data.success === false) {
          // ❌ Email already exists
          const errorMessage = isRTL 
            ? (data.messageAr || t('signup.emailAlreadyExists'))
            : (data.message || t('signup.emailAlreadyExists'));
          
          setMerchantErrors(prev => ({ 
            ...prev, 
            email: errorMessage
          }));
        }
      } catch (error) {
        console.error('❌ Error checking email:', error);
      } finally {
        setIsCheckingEmail(false);
      }
    }
  }, 500); // 500ms debounce

  return () => clearTimeout(timeoutId);
}
```

**Benefits:**
- ✅ Server-side check (more reliable)
- ✅ Checks across ALL stores
- ✅ No need to fetch all users
- ✅ Scalable and efficient
- ✅ Consistent with other forms

---

## 🔑 Key Differences / الفروقات الرئيسية

### Store Registration vs Other Forms

| Aspect | Store Registration | Users/Wholesalers Forms |
|--------|-------------------|------------------------|
| **storeSlug** | `''` (empty) | `storeInfo.slug` |
| **Check Scope** | Global (all stores) | Per store |
| **Use Case** | New store owner | Add user to existing store |

**Why empty storeSlug?**
- Store registration = no store created yet
- Need to check if email exists **globally** (across all stores)
- Backend handles empty storeSlug → checks globally

---

## 🔄 Flow Comparison / مقارنة التدفق

### OLD Flow (Client-side):
```
User types email
    ↓
Wait 500ms
    ↓
getAllUsers() → Fetch ALL users from backend
    ↓
Loop through users
    ↓
Check if email matches
    ↓
❌ Slow (fetches all users)
❌ Only checks current store
```

### NEW Flow (API):
```
User types email
    ↓
Wait 500ms
    ↓
POST /api/auth/check-email
    {
      email: "owner@example.com",
      storeSlug: ""  // Empty = check globally
    }
    ↓
Backend checks database efficiently
    ↓
Returns: { available: true/false }
    ↓
✅ Fast (single query)
✅ Checks all stores
```

---

## 📊 API Request / طلب API

### Request:
```http
POST /api/auth/check-email
Content-Type: application/json

{
  "email": "newowner@example.com",
  "storeSlug": ""
}
```

**Note:** `storeSlug` is **empty string** for store registration.

### Response (Available):
```json
{
  "success": true,
  "message": "Email is available",
  "messageAr": "البريد الإلكتروني متاح للاستخدام",
  "email": "newowner@example.com",
  "available": true
}
```

### Response (Taken):
```json
{
  "success": false,
  "message": "This email address is already registered",
  "messageAr": "عنوان البريد الإلكتروني هذا مسجل بالفعل",
  "email": "existing@example.com",
  "available": false,
  "accounts": [
    {
      "role": "admin",
      "storeId": "...",
      "storeName": "Existing Store",
      "storeSlug": "existing-store"
    }
  ]
}
```

---

## 🎨 UI States / حالات الواجهة

### 1. Checking (جاري الفحص)
```
Email field: [owner@email.com] 🔄
Status: "Checking email availability..."
Button: Enabled (but validation pending)
```

### 2. Available (متاح)
```
Email field: [owner@email.com] ✅
Status: Clear (no error)
Button: Enabled
```

### 3. Taken (مستخدم)
```
Email field: [owner@email.com] ❌
Error: "This email address is already registered"
Button: Disabled
```

---

## 🧪 Testing / الاختبار

### Test Case 1: New Store Owner with Available Email

**Steps:**
1. Open store registration wizard
2. Enter email: `newowner@test.com`
3. Wait 500ms

**Expected:**
- ✅ No error shown
- ✅ Can proceed to next step
- ✅ API called with `storeSlug: ""`

### Test Case 2: Email Already Exists Globally

**Steps:**
1. Enter email: `existing@test.com` (exists in another store)
2. Wait 500ms

**Expected:**
- ❌ Error: "This email address is already registered"
- ❌ Shows which store(s) have this email
- ❌ Cannot proceed until email changed

### Test Case 3: Fast Typing (Debounce)

**Steps:**
1. Type quickly: `o`, `w`, `n`, `e`, `r`, `@`, ...
2. Stop typing

**Expected:**
- 🔄 Only ONE API call after 500ms
- ⚡ Not multiple calls while typing
- ✅ Efficient

---

## 📋 Checklist / قائمة التحقق

### Store Registration Email Check:
- [x] ✅ Uses `/api/auth/check-email` API
- [x] ✅ Sends `storeSlug: ""` (empty for global check)
- [x] ✅ 500ms debounce
- [x] ✅ Shows backend error messages
- [x] ✅ Loading state (isCheckingEmail)
- [x] ✅ Clears error when available
- [x] ✅ Bilingual support (AR/EN)

### Removed Old Code:
- [x] ✅ Removed `checkEmailExists` from imports
- [x] ✅ Removed client-side check
- [x] ✅ No longer calls `getAllUsers()`

---

## 🎯 Summary / الملخص

### What Changed:

**Old Method:**
```typescript
// ❌ Client-side check
const { checkEmailExists } = useUser();
const emailExists = await checkEmailExists(value);
```

**New Method:**
```typescript
// ✅ API check (server-side)
const response = await fetch('/api/auth/check-email', {
  method: 'POST',
  body: JSON.stringify({
    email: value,
    storeSlug: ''  // Empty = global check
  })
});
```

### Why This is Better:

1. ✅ **Server-side validation** (more secure)
2. ✅ **Global email check** (across all stores)
3. ✅ **Efficient** (no need to fetch all users)
4. ✅ **Consistent** (same API as other forms)
5. ✅ **Scalable** (works with millions of users)

### Special Case:

**Store Registration:**
- No store exists yet → Can't check per-store
- Use `storeSlug: ""` → Backend checks **globally**
- Ensures email is unique **system-wide**

---

## 🔧 Files Modified / الملفات المعدلة

| File | Change | Status |
|------|--------|--------|
| `src/pages/store/StoreRegistrationWizard.tsx` | Updated email check to use API | ✅ Done |
| `src/pages/users/UserForm.tsx` | Uses API with storeSlug | ✅ Done |
| `src/pages/wholeSallers/componnent/sallersDrawer.tsx` | Uses API with storeSlug | ✅ Done |

---

## 📊 All Forms Now Use Same API / جميع النماذج تستخدم نفس API

### Unified Email Check Across Application:

1. **Store Registration** 
   - API: `/api/auth/check-email`
   - storeSlug: `""` (global check)
   - Use case: New store owner

2. **User Form**
   - API: `/api/auth/check-email`
   - storeSlug: `"current-store"`
   - Use case: Add admin to store

3. **Wholesaler Form**
   - API: `/api/auth/check-email`
   - storeSlug: `"current-store"`
   - Use case: Add wholesaler to store

4. **Signup Page** (if applicable)
   - API: `/api/auth/check-email`
   - storeSlug: varies
   - Use case: User signup

---

## ✅ Result / النتيجة

**Before:**
- ⚠️ Client-side check (slow, limited)
- ⚠️ Different methods in different forms
- ⚠️ Inconsistent

**After:**
- ✅ Server-side API (fast, reliable)
- ✅ Same method everywhere
- ✅ Consistent and maintainable

---

**تم التحديث بنجاح! / Update Complete!** ✅

Now **ALL forms** use the same `/api/auth/check-email` API for consistent email validation!

الآن **جميع النماذج** تستخدم نفس API `/api/auth/check-email` للتحقق المتسق من البريد الإلكتروني!

---

*Updated: 2025-01-20*  
*Status: ✅ COMPLETE*  
*No Linter Errors: ✅*


