# Bilingual API Error Messages Implementation

## 📋 Overview
This document describes the implementation of bilingual error message support for API responses, allowing the frontend to display errors in both English and Arabic based on the user's selected language.

## 🎯 Implementation Details

### 1. **Error Message Structure Support**

The frontend now supports **both** old and new backend API response formats:

#### **Old Format** (Backward Compatible)
```json
{
  "success": false,
  "message": "Error message in English",
  "messageAr": "رسالة الخطأ بالعربية",
  "error": "Error Title",
  "errorAr": "عنوان الخطأ"
}
```

#### **New Format** (Primary)
```json
{
  "success": false,
  "message_en": "Error message in English",
  "message_ar": "رسالة الخطأ بالعربية",
  "error_en": "Error Title",
  "error_ar": "عنوان الخطأ"
}
```

### 2. **Updated Files**

#### **A. `src/utils/errorUtils.ts`**

##### **Enhanced `getErrorMessage()` Function**
```typescript
export const getErrorMessage = (
  error: any, 
  isRTL: boolean = false, 
  fallbackMessage: { title: string; message: string }
) => {
  const errorData = error?.response?.data || error;
  
  let title = '';
  let message = '';
  
  if (errorData) {
    // Priority: Check for new backend format (message_en, message_ar)
    if (isRTL) {
      message = errorData.message_ar || errorData.messageAr || errorData.message || '';
      title = errorData.error_ar || errorData.errorAr || errorData.error || 'خطأ';
    } else {
      message = errorData.message_en || errorData.message || errorData.messageAr || '';
      title = errorData.error_en || errorData.error || errorData.errorAr || 'Error';
    }
    
    // If still no message found, use fallback
    if (!message) {
      title = fallbackMessage.title;
      message = fallbackMessage.message;
    }
  } else {
    title = fallbackMessage.title;
    message = fallbackMessage.message;
  }
  
  return { title, message };
};
```

##### **New Helper Functions**

**`getApiMessage()`** - Extract message from API response
```typescript
export const getApiMessage = (
  data: any,
  isRTL: boolean,
  fallback: string = ''
): string => {
  if (isRTL) {
    return data?.message_ar || data?.messageAr || data?.message || fallback;
  }
  return data?.message_en || data?.message || data?.messageAr || fallback;
};
```

**`getApiErrorTitle()`** - Extract error title from API response
```typescript
export const getApiErrorTitle = (
  data: any,
  isRTL: boolean,
  fallback?: string
): string => {
  const defaultFallback = fallback || (isRTL ? 'خطأ' : 'Error');
  
  if (isRTL) {
    return data?.error_ar || data?.errorAr || data?.error || defaultFallback;
  }
  return data?.error_en || data?.error || data?.errorAr || defaultFallback;
};
```

#### **B. Updated Interfaces**

**`usePaymentMethods.ts`**
```typescript
interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
  // Old format (backward compatibility)
  message?: string;
  messageAr?: string;
  error?: string;
  errorAr?: string;
  // New format
  message_en?: string;
  message_ar?: string;
  error_en?: string;
  error_ar?: string;
  pagination?: { ... };
}
```

**`useStore.ts`**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  // Old format (backward compatibility)
  message?: string;
  messageAr?: string;
  error?: string;
  errorAr?: string;
  // New format
  message_en?: string;
  message_ar?: string;
  error_en?: string;
  error_ar?: string;
}
```

### 3. **Usage Pattern**

#### **In Hooks (e.g., usePaymentMethods, useStore)**

```typescript
// Using helper functions
import { getApiMessage, getApiErrorTitle } from '../utils/errorUtils';

// Success message
if (data.success) {
  const successMessage = getApiMessage(data, isRTL, 'Operation successful');
  showSuccess(successMessage, isRTL ? 'نجاح' : 'Success');
}

// Error message
else {
  const errorMessage = getApiMessage(
    data, 
    isRTL, 
    isRTL ? 'حدث خطأ' : 'An error occurred'
  );
  const errorTitle = getApiErrorTitle(
    data, 
    isRTL, 
    isRTL ? 'خطأ' : 'Error'
  );
  
  showError(errorMessage, errorTitle);
}
```

#### **Using `getErrorMessage()` in catch blocks**

```typescript
try {
  // API call
} catch (err: any) {
  const errorMsg = getErrorMessage(err, isRTL, {
    title: isRTL ? 'خطأ في العملية' : 'Operation Error',
    message: isRTL ? 'فشلت العملية' : 'Operation failed'
  });
  showError(errorMsg.message, errorMsg.title);
}
```

### 4. **Priority Order**

The system checks for messages in the following priority:

**For Arabic (isRTL = true):**
1. `message_ar` (new format)
2. `messageAr` (old format)
3. `message` (generic)
4. Fallback message

**For English (isRTL = false):**
1. `message_en` (new format)
2. `message` (generic)
3. `messageAr` (as last resort)
4. Fallback message

### 5. **Affected Components**

✅ **All hooks using API calls:**
- `usePaymentMethods.ts`
- `useStore.ts`
- `useProducts.ts`
- `useCategories.ts`
- `useDeliveryMethods.ts`
- `useCustomers.ts`
- `useAuth.ts`
- And all other hooks...

✅ **All error handling uses `getErrorMessage()` utility**

✅ **Consistent display of bilingual messages across:**
- Login/Signup forms
- Store creation forms
- Product management
- Category management
- Payment methods
- Delivery methods
- All CRUD operations

### 6. **Testing Checklist**

- [x] Old format messages still work (backward compatibility)
- [x] New format messages (`message_en`, `message_ar`) are prioritized
- [x] Fallback messages work when API doesn't send messages
- [x] Arabic messages display correctly when `isRTL = true`
- [x] English messages display correctly when `isRTL = false`
- [x] Error titles display in correct language
- [x] Success messages display in correct language
- [x] Toast notifications show correct language
- [x] Form validation errors show correct language

### 7. **Example API Responses**

#### **Error Response**
```json
{
  "success": false,
  "message_en": "Cannot deactivate the default payment method. Please set another method as default first.",
  "message_ar": "لا يمكن إلغاء تفعيل طريقة الدفع الافتراضية. يرجى تعيين طريقة أخرى كافتراضية أولاً.",
  "error_en": "Default method cannot be inactive",
  "error_ar": "الطريقة الافتراضية لا يمكن أن تكون غير نشطة"
}
```

**Frontend will display:**
- **Arabic**: Error title: "الطريقة الافتراضية لا يمكن أن تكون غير نشطة", Message: "لا يمكن إلغاء تفعيل طريقة الدفع الافتراضية..."
- **English**: Error title: "Default method cannot be inactive", Message: "Cannot deactivate the default payment method..."

#### **Success Response**
```json
{
  "success": true,
  "message_en": "Payment method updated successfully",
  "message_ar": "تم تحديث طريقة الدفع بنجاح",
  "data": { ... }
}
```

## 🎯 **Benefits**

1. ✅ **Backward Compatibility** - Old API responses still work
2. ✅ **Future-Proof** - Ready for new backend format
3. ✅ **Consistent UX** - Same error display pattern everywhere
4. ✅ **Automatic Language Detection** - Based on user's `isRTL` setting
5. ✅ **Fallback Support** - Always shows a message even if API doesn't provide one
6. ✅ **Type Safety** - Full TypeScript support with updated interfaces

## 📝 **Notes**

- The system automatically detects the language from the `isRTL` flag (from `useLanguage` hook)
- All existing code continues to work with backward compatibility
- New backend responses with `message_en`/`message_ar` are automatically prioritized
- Fallback messages ensure users always see meaningful error messages

## 🚀 **Result**

**All API error and success messages now display in the correct language automatically!** 🎉

