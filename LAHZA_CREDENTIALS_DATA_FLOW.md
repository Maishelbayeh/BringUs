# ✅ Lahza Credentials Data Flow - COMPLETE

## 🔍 **How Lahza Credentials Are Stored and Retrieved**

### **📦 Data Structure in Store Model**

Lahza credentials are stored in the **Store model** under the `settings` object:

```javascript
// Store Document (MongoDB)
{
  "_id": "68de4e4b9d281851c29f1fc3",
  "nameAr": "متجري",
  "nameEn": "My Store",
  "slug": "my-store",
  
  // ← Lahza credentials are here
  "settings": {
    "currency": "ILS",
    "mainColor": "#1976d2",
    "language": "ar",
    "lahzaToken": "merchant-code-12345",      // ← Merchant Code
    "lahzaSecretKey": "secret-key-xyz123",    // ← Secret Key
    "storeDiscount": 0,
    "taxRate": 0,
    "shippingEnabled": true,
    "storeSocials": {
      "facebook": "",
      "instagram": "",
      // ...
    }
  },
  
  "contact": {
    "email": "store@example.com",
    "phone": "+970598765432",
    "address": { /*...*/ }
  }
}
```

---

## 🔄 **Data Flow in LahzaCredentialsModal**

### **Step 1: Modal Opens** 🚀
```typescript
// User selects "Lahza" payment method type
<LahzaCredentialsModal
  isOpen={showLahzaCredentialsModal}
  onClose={() => setShowLahzaCredentialsModal(false)}
  onCredentialsSaved={() => { /* refresh data */ }}
  isRTL={isRTL}
/>
```

### **Step 2: Auto-Check Credentials** 🔍
```typescript
useEffect(() => {
  if (isOpen) {
    checkLahzaCredentials(); // ← Automatically called when modal opens
  }
}, [isOpen]);
```

### **Step 3: Fetch Store Data** 📥
```typescript
const checkLahzaCredentials = async () => {
  const storeId = getStoreId();
  const token = getAuthToken();
  
  // GET store data
  const response = await fetch(`${BASE_URL}stores/${storeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  const storeData = data.data;
  
  // ← Extract Lahza credentials from store.settings
  const lahzaToken = storeData.settings?.lahzaToken;
  const lahzaSecretKey = storeData.settings?.lahzaSecretKey;
}
```

### **Step 4: Check Credentials Status** ✅/⚠️
```typescript
// Check if both credentials exist
const hasToken = Boolean(
  storeData.settings?.lahzaToken && 
  storeData.settings.lahzaToken.trim() !== ''
);

const hasSecretKey = Boolean(
  storeData.settings?.lahzaSecretKey && 
  storeData.settings.lahzaSecretKey.trim() !== ''
);

const hasCredentials = hasToken && hasSecretKey;

// ← Set status for UI
setStatus({
  hasCredentials,      // true if BOTH exist
  hasToken,           // true if token exists
  hasSecretKey,       // true if secret key exists
  token: hasToken ? '***configured***' : undefined,
  secretKey: hasSecretKey ? '***configured***' : undefined
});
```

### **Step 5: Populate Form** 📝
```typescript
// If credentials exist, show them in the form
if (hasCredentials) {
  setCredentials({
    lahzaToken: storeData.settings.lahzaToken,       // ← Actual value
    lahzaSecretKey: storeData.settings.lahzaSecretKey // ← Actual value
  });
} else {
  // Pre-fill with any existing values (even if incomplete)
  setCredentials({
    lahzaToken: storeData.settings?.lahzaToken || '',
    lahzaSecretKey: storeData.settings?.lahzaSecretKey || ''
  });
}
```

### **Step 6: Display in UI** 🎨

**If Credentials Exist** ✅:
```
┌─────────────────────────────────────────┐
│ ✅ Credentials Configured                │
│ You can update the credentials below    │
│                                          │
│ Merchant Code:                           │
│ [merchant-code-12345]  (actual value)   │
│                                          │
│ Secret Key:                              │
│ [●●●●●●●●●●●●●●●]  (password field)       │
│                                          │
└─────────────────────────────────────────┘
```

**If Credentials Missing** ⚠️:
```
┌─────────────────────────────────────────┐
│ ⚠️ Credentials Not Complete              │
│ Please enter Lahza credentials          │
│ • Merchant Code missing                  │
│ • Secret Key missing                     │
│                                          │
│ Merchant Code:                           │
│ [_______________________]  (empty)      │
│                                          │
│ Secret Key:                              │
│ [_______________________]  (empty)      │
│                                          │
└─────────────────────────────────────────┘
```

---

## 💾 **Saving Credentials**

### **Step 1: User Fills Form**
```typescript
// User enters:
credentials = {
  lahzaToken: "merchant-code-12345",
  lahzaSecretKey: "secret-key-xyz123"
}
```

### **Step 2: Form Validation** ✅
```typescript
const validateForm = (): boolean => {
  const newErrors: { lahzaToken?: string; lahzaSecretKey?: string } = {};
  
  if (!credentials.lahzaToken || credentials.lahzaToken.trim() === '') {
    newErrors.lahzaToken = isRTL 
      ? 'رمز التاجر مطلوب' 
      : 'Merchant Code is required';
  }
  
  if (!credentials.lahzaSecretKey || credentials.lahzaSecretKey.trim() === '') {
    newErrors.lahzaSecretKey = isRTL 
      ? 'المفتاح السري مطلوب' 
      : 'Secret Key is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### **Step 3: Save to Backend** 💾
```typescript
const saveLahzaCredentials = async () => {
  if (!validateForm()) return;
  
  const storeId = getStoreId();
  const token = getAuthToken();
  
  // PATCH request to update store info
  const response = await fetch(`${BASE_URL}store-info/update`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      storeId: storeId,
      lahzaToken: credentials.lahzaToken.trim(),       // ← Saved to settings.lahzaToken
      lahzaSecretKey: credentials.lahzaSecretKey.trim() // ← Saved to settings.lahzaSecretKey
    })
  });
}
```

### **Step 4: Backend Updates Store** 🔄
```javascript
// Backend (PATCH /api/store-info/update)
const store = await Store.findById(storeId);

store.settings = {
  ...store.settings,
  lahzaToken: req.body.lahzaToken,           // ← Updates this field
  lahzaSecretKey: req.body.lahzaSecretKey    // ← Updates this field
};

await store.save();
```

### **Step 5: Success Feedback** ✅
```typescript
if (data.success || response.ok) {
  showSuccess(
    isRTL ? 'تم حفظ بيانات اعتماد لحظة بنجاح' : 'Lahza credentials saved successfully',
    isRTL ? 'نجاح' : 'Success'
  );
  
  onCredentialsSaved(); // ← Notify parent
  onClose();            // ← Close modal
}
```

---

## 📊 **Field Mapping**

| UI Field | API Field | Store Model Path | Description |
|----------|-----------|------------------|-------------|
| **Merchant Code** | `lahzaToken` | `store.settings.lahzaToken` | رمز التاجر من لحظة |
| **Secret Key** | `lahzaSecretKey` | `store.settings.lahzaSecretKey` | المفتاح السري من لحظة |

---

## 🔍 **Where to Find Lahza Credentials**

### **In StoreGeneralInfo.tsx** (Lines 110-112, 730-731)
```typescript
settings: {
  lahzaToken: '',              // ← Merchant Code
  lahzaSecretKey: '',          // ← Secret Key
  mainColor: '#1976d2',
  currency: 'ILS',
  // ...
}
```

### **When Loading Store Data** (Lines 729-731)
```typescript
setForm({
  // ...
  settings: {
    lahzaToken: store.settings?.lahzaToken || '',         // ← From backend
    lahzaSecretKey: store.settings?.lahzaSecretKey || '', // ← From backend
    // ...
  }
});
```

### **Form Input Fields** (Lines 1043-1060)
```tsx
<CustomInput
  label={t('stores.lahzaToken')}
  name="lahzaToken"
  value={form.settings.lahzaToken}    // ← Displayed here
  onChange={handleLahzaTokenChange}
  placeholder={t('stores.lahzaTokenPlaceholder')}
/>

<CustomInput
  label={t('stores.lahzaSecretKey')}
  name="lahzaSecretKey"
  value={form.settings.lahzaSecretKey} // ← Displayed here
  onChange={handleLahzaSecretKeyChange}
  placeholder={t('stores.lahzaSecretKeyPlaceholder')}
/>
```

---

## 🎯 **Complete User Journey**

### **Scenario A: First Time Setup**
```
1. Admin creates new payment method
    ↓
2. Selects "Lahza" from dropdown
    ↓
3. Modal automatically opens
    ↓
4. System fetches store data:
   GET /api/stores/{storeId}
    ↓
5. Checks: store.settings.lahzaToken & lahzaSecretKey
    ↓
6. Result: Both empty/null
    ↓
7. Shows: ⚠️ Yellow warning banner
   "Credentials Not Complete"
   • Merchant Code missing
   • Secret Key missing
    ↓
8. User enters:
   - Merchant Code: "merchant-123"
   - Secret Key: "secret-xyz"
    ↓
9. User clicks "Save Credentials"
    ↓
10. System saves:
    PATCH /api/store-info/update
    {
      storeId: "...",
      lahzaToken: "merchant-123",
      lahzaSecretKey: "secret-xyz"
    }
    ↓
11. Backend updates:
    store.settings.lahzaToken = "merchant-123"
    store.settings.lahzaSecretKey = "secret-xyz"
    ↓
12. Success toast shown
13. Modal closes
14. User continues with payment method creation
    ↓
15. ✅ Lahza payment method saved
```

### **Scenario B: Credentials Already Exist**
```
1. Admin selects "Lahza" payment method
    ↓
2. Modal opens
    ↓
3. System fetches store data:
   GET /api/stores/{storeId}
    ↓
4. Finds:
   store.settings.lahzaToken = "merchant-123"
   store.settings.lahzaSecretKey = "secret-xyz"
    ↓
5. Shows: ✅ Green success banner
   "Credentials Configured"
    ↓
6. Form pre-filled with actual values:
   - Merchant Code: "merchant-123"
   - Secret Key: "secret-xyz" (as password)
    ↓
7. User can:
   Option A: Close modal (credentials OK)
   Option B: Update credentials
    ↓
8. If update:
   - Change values
   - Click "Save Credentials"
   - PATCH /api/store-info/update
   - New values saved
    ↓
9. ✅ Modal closes
```

---

## 🔐 **Security Features**

### **1. Masked Display**
When showing status:
```typescript
token: hasToken ? '***configured***' : undefined
```
Shows `***configured***` instead of actual value in status banner.

### **2. Password Field**
```tsx
<CustomInput
  type="password"    // ← Secret key shown as dots
  value={credentials.lahzaSecretKey}
/>
```

### **3. Actual Values in Form**
When editing, actual values are loaded:
```typescript
setCredentials({
  lahzaToken: storeData.settings.lahzaToken,       // ← Real value for editing
  lahzaSecretKey: storeData.settings.lahzaSecretKey // ← Real value for editing
});
```

---

## 📡 **API Endpoints Used**

### **1. Fetch Store Data (to check credentials)**
```
GET /api/stores/{storeId}

Response:
{
  "success": true,
  "data": {
    "_id": "68de4e4b9d281851c29f1fc3",
    "nameAr": "متجري",
    "settings": {
      "lahzaToken": "merchant-123",      // ← We read this
      "lahzaSecretKey": "secret-xyz",    // ← We read this
      // ...
    }
  }
}
```

### **2. Update Store Info (to save credentials)**
```
PATCH /api/store-info/update

Request Body:
{
  "storeId": "68de4e4b9d281851c29f1fc3",
  "lahzaToken": "merchant-123",          // ← We send this
  "lahzaSecretKey": "secret-xyz"         // ← We send this
}

Response:
{
  "success": true,
  "message": "Store information updated successfully",
  "messageAr": "تم تحديث معلومات المتجر بنجاح",
  "data": {
    "_id": "68de4e4b9d281851c29f1fc3",
    "settings": {
      "lahzaToken": "merchant-123",      // ← Updated
      "lahzaSecretKey": "secret-xyz"     // ← Updated
    }
  }
}
```

---

## 🎨 **UI States**

### **State 1: Loading (Checking)** ⏳
```
┌─────────────────────────────────────┐
│  🔄 Lahza Credentials         ✕    │
├─────────────────────────────────────┤
│                                     │
│         [Loading Spinner]           │
│   Checking credentials...           │
│                                     │
└─────────────────────────────────────┘
```

### **State 2: Credentials Exist** ✅
```
┌─────────────────────────────────────┐
│  🔐 Lahza Credentials         ✕    │
├─────────────────────────────────────┤
│                                     │
│  ✅ Credentials Configured          │
│  You can update the credentials     │
│  below if needed                    │
│                                     │
│  Merchant Code: *                   │
│  [merchant-code-12345]              │
│  The code provided by Lahza...      │
│                                     │
│  Secret Key: *                      │
│  [●●●●●●●●●●●●●●●]                   │
│  Your secret key from Lahza...      │
│                                     │
│  ℹ️ Note: You can get these...      │
│                                     │
│        [Cancel]  [Save Credentials] │
└─────────────────────────────────────┘
```

### **State 3: Credentials Missing** ⚠️
```
┌─────────────────────────────────────┐
│  🔐 Lahza Credentials         ✕    │
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Credentials Not Complete        │
│  Please enter Lahza credentials     │
│  to activate payment method         │
│  • Merchant Code missing            │
│  • Secret Key missing               │
│                                     │
│  Merchant Code: *                   │
│  [Enter merchant code______]        │
│  The code provided by Lahza...      │
│                                     │
│  Secret Key: *                      │
│  [Enter secret key________]         │
│  Your secret key from Lahza...      │
│                                     │
│  ℹ️ Note: You can get these...      │
│                                     │
│        [Cancel]  [Save Credentials] │
└─────────────────────────────────────┘
```

---

## 🔄 **Data Flow Diagram**

```
┌─────────────────────────────────────────────────┐
│            LahzaCredentialsModal                │
└─────────────────┬───────────────────────────────┘
                  │
                  │ (1) Modal Opens
                  ↓
        ┌─────────────────────┐
        │ checkLahzaCredentials() │
        └─────────┬───────────┘
                  │
                  │ (2) Fetch Store Data
                  ↓
┌─────────────────────────────────────────────────┐
│     GET /api/stores/{storeId}                   │
│                                                  │
│     Returns:                                     │
│     {                                            │
│       "data": {                                  │
│         "settings": {                            │
│           "lahzaToken": "...",      ← Read      │
│           "lahzaSecretKey": "..."   ← Read      │
│         }                                        │
│       }                                          │
│     }                                            │
└─────────────────┬───────────────────────────────┘
                  │
                  │ (3) Extract & Check
                  ↓
        ┌─────────────────────┐
        │  hasToken = Boolean(...)  │
        │  hasSecretKey = Boolean(...)│
        │  hasCredentials = both    │
        └─────────┬───────────┘
                  │
                  │ (4) Update UI
                  ↓
        ┌─────────────────────┐
        │  setStatus({...})    │
        │  setCredentials({...})│
        └─────────┬───────────┘
                  │
                  │ (5) Display Status
                  ↓
┌─────────────────────────────────────────────────┐
│  ✅ Green Banner (if complete)                   │
│  ⚠️ Yellow Banner (if incomplete)                │
│                                                  │
│  Form fields with actual values                  │
└─────────────────┬───────────────────────────────┘
                  │
                  │ (6) User Edits & Saves
                  ↓
        ┌─────────────────────┐
        │ saveLahzaCredentials()│
        └─────────┬───────────┘
                  │
                  │ (7) Update Store
                  ↓
┌─────────────────────────────────────────────────┐
│     PATCH /api/store-info/update                │
│                                                  │
│     Body:                                        │
│     {                                            │
│       "storeId": "...",                          │
│       "lahzaToken": "...",         ← Save       │
│       "lahzaSecretKey": "..."      ← Save       │
│     }                                            │
└─────────────────┬───────────────────────────────┘
                  │
                  │ (8) Success Response
                  ↓
        ┌─────────────────────┐
        │  showSuccess(...)    │
        │  onCredentialsSaved()│
        │  onClose()           │
        └─────────────────────┘
```

---

## ✅ **Summary**

**Data Source**: `store.settings.lahzaToken` & `store.settings.lahzaSecretKey`

**Fetch API**: `GET /api/stores/{storeId}` → Returns full store data with settings

**Save API**: `PATCH /api/store-info/update` → Updates Lahza credentials in store

**Display**:
- ✅ If credentials exist → Green banner + pre-filled form
- ⚠️ If missing → Yellow warning + empty form
- 🔒 Secret key always shown as password field
- 🎨 Status banner shows which fields are missing

**Security**:
- Status display shows `***configured***` (masked)
- Form shows actual values for editing
- Secret key field is `type="password"`

---

**Status**: ✅ **COMPLETE**  
**Data Flow**: 📊 **DOCUMENTED**  
**Security**: 🔒 **SECURE**  
**User Experience**: 🚀 **PROFESSIONAL**


