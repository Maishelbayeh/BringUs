# Payment Methods Frontend Update

## Overview
This document describes the frontend updates made to support the new PaymentMethod model structure with QR codes and payment images.

## Changes Made

### 1. **Types.tsx Updates**
- ✅ **Added new interfaces:**
  - `PaymentImage` - for payment images with URL, type, and alt text
  - `QrCode` - for QR code configuration
- ✅ **Updated PaymentMethod interface:**
  - Removed old fields: `processingFee`, `minimumAmount`, `maximumAmount`, `supportedCurrencies`
  - Added new fields: `qrCode`, `paymentImages`, `store`
  - Updated `methodType` to include `qr_code`
  - Changed `id` to support both `_id` (MongoDB) and `id` (legacy)

### 2. **usePaymentMethods Hook (New)**
- ✅ **Created comprehensive hook** for all payment method operations:
  - `fetchPaymentMethods()` - Get all payment methods
  - `fetchPaymentMethod(id)` - Get single payment method
  - `createPaymentMethod(data)` - Create new payment method
  - `updatePaymentMethod(id, data)` - Update existing payment method
  - `deletePaymentMethod(id)` - Delete payment method
  - `toggleActiveStatus(id)` - Toggle active status
  - `setAsDefault(id)` - Set as default method
  - `uploadLogo(id, file)` - Upload logo image
  - `uploadQrCode(id, file, data)` - Upload QR code image
  - `uploadPaymentImage(id, file, type, altText)` - Upload payment image
  - `removePaymentImage(id, index)` - Remove payment image

### 3. **PaymentForm Component Updates**
- ✅ **Removed old fields:**
  - Processing fee, minimum/maximum amounts, supported currencies
- ✅ **Added new sections:**
  - **QR Code Section:** Enable/disable, URL, data, image upload
  - **Logo Upload:** Dedicated logo upload section
  - **Payment Images:** Multiple image upload with types and alt text
- ✅ **Enhanced validation** for new fields
- ✅ **Improved UI** with organized sections and better UX

### 4. **PaymentCard Component Updates**
- ✅ **Removed financial details** (processing fee, amounts, currencies)
- ✅ **Added QR code indicator** with image preview
- ✅ **Added payment images gallery** with type badges
- ✅ **Updated method type support** for QR code
- ✅ **Improved visual design** with better information hierarchy

### 5. **PaymentMethods Component Updates**
- ✅ **Integrated usePaymentMethods hook** for real API calls
- ✅ **Added loading and error states**
- ✅ **Updated all operations** to use async API calls
- ✅ **Removed mock data** and local state management
- ✅ **Added proper error handling** and user feedback

### 6. **Validation Updates**
- ✅ **Updated paymentValidation.ts** to match new model
- ✅ **Removed validation** for old fields
- ✅ **Added validation** for QR code and payment images
- ✅ **Enhanced field validators** for new structure

### 7. **Translation Updates**
- ✅ **Added new translation keys** for:
  - QR code functionality
  - Payment images
  - Image types
  - New form fields
- ✅ **Updated both English and Arabic** translations
- ✅ **Added method type** for QR code

## New Features

### QR Code Support
- Enable/disable QR code functionality
- Upload QR code images
- Add QR code data/URL
- Visual indicators in payment cards

### Payment Images
- Multiple image upload per payment method
- Different image types (logo, banner, QR code, payment screenshot, other)
- Alt text support for accessibility
- Image gallery with type badges
- Remove individual images

### Enhanced UI/UX
- Organized form sections
- Better visual hierarchy
- Loading states and error handling
- Improved responsive design
- Better accessibility

## API Integration

### Endpoints Used
```
GET    /api/payment-methods          - Get all payment methods
GET    /api/payment-methods/:id      - Get single payment method
POST   /api/payment-methods          - Create payment method
PUT    /api/payment-methods/:id      - Update payment method
DELETE /api/payment-methods/:id      - Delete payment method
PATCH  /api/payment-methods/:id/toggle-active - Toggle active status
PATCH  /api/payment-methods/:id/set-default - Set as default
POST   /api/payment-methods/:id/upload-logo - Upload logo
POST   /api/payment-methods/:id/upload-qr-code - Upload QR code
POST   /api/payment-methods/:id/upload-payment-image - Upload payment image
DELETE /api/payment-methods/:id/remove-payment-image/:index - Remove image
```

### Authentication
- All endpoints require JWT token
- Store isolation for multi-tenant support
- Admin/superadmin authorization required

## File Structure

```
src/
├── hooks/
│   └── usePaymentMethods.ts          # New payment methods hook
├── pages/payment/
│   ├── PaymentMethods.tsx            # Updated main component
│   └── componant/
│       ├── paymentForm.tsx           # Updated form component
│       ├── paymentcard.tsx           # Updated card component
│       └── paymentValidation.ts      # Updated validation
├── Types.tsx                         # Updated interfaces
└── localization/
    ├── en.json                       # Updated English translations
    └── ar.json                       # Updated Arabic translations
```

## Usage Examples

### Creating a Payment Method
```typescript
const { createPaymentMethod } = usePaymentMethods();

const newMethod = {
  titleAr: "الدفع عند الاستلام",
  titleEn: "Cash on Delivery",
  descriptionAr: "ادفع عند استلام طلبك",
  descriptionEn: "Pay when you receive your order",
  methodType: "cash",
  isActive: true,
  isDefault: false,
  qrCode: {
    enabled: false
  },
  paymentImages: []
};

await createPaymentMethod(newMethod);
```

### Uploading Images
```typescript
const { uploadLogo, uploadQrCode, uploadPaymentImage } = usePaymentMethods();

// Upload logo
await uploadLogo(methodId, logoFile);

// Upload QR code
await uploadQrCode(methodId, qrCodeFile, "payment://qr-data");

// Upload payment image
await uploadPaymentImage(methodId, imageFile, "payment_screenshot", "Payment screenshot");
```

## Migration Notes

### Breaking Changes
- Removed `processingFee`, `minimumAmount`, `maximumAmount`, `supportedCurrencies` fields
- Changed `id` field to support both `_id` (MongoDB) and `id` (legacy)
- Updated method type enum to include `qr_code`

### Backward Compatibility
- Maintained support for legacy `id` field
- Graceful handling of missing new fields
- Fallback to default values for optional fields

## Testing

### Manual Testing Checklist
- [ ] Create new payment method with all fields
- [ ] Edit existing payment method
- [ ] Upload logo image
- [ ] Upload QR code image
- [ ] Upload multiple payment images
- [ ] Remove payment images
- [ ] Toggle active status
- [ ] Set as default
- [ ] Delete payment method
- [ ] Test validation errors
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test responsive design
- [ ] Test RTL layout

### API Testing
- [ ] Test all CRUD operations
- [ ] Test image upload endpoints
- [ ] Test authentication
- [ ] Test store isolation
- [ ] Test validation responses
- [ ] Test error responses

## Future Enhancements

### Potential Improvements
- Image cropping and resizing
- Drag and drop image upload
- Image preview modal
- Bulk image operations
- Image optimization
- Advanced QR code generation
- Payment method templates
- Import/export functionality

### Performance Optimizations
- Image lazy loading
- Pagination for large image galleries
- Image compression
- Caching strategies
- Optimistic updates 