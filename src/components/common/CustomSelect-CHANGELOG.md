# CustomSelect Changelog

## [2.0.0] - 2024-12-19

### ✨ Added
- **Search Functionality**: إضافة إمكانية البحث في الخيارات
- **Enhanced UI**: تحسين واجهة المستخدم مع تصميم حديث
- **RTL Support**: دعم كامل للغة العربية
- **Auto-close**: إغلاق تلقائي عند النقر خارج القائمة
- **Placeholder Support**: دعم النص الافتراضي المخصص
- **Keyboard Navigation**: تحسين التنقل باللوحة المفاتيح

### 🔧 Changed
- **Backward Compatibility**: الحفاظ على التوافق مع الإصدارات السابقة
- **Performance**: تحسين الأداء مع القوائم الكبيرة
- **Accessibility**: تحسين إمكانية الوصول

### 🐛 Fixed
- **RTL Layout**: إصلاح تخطيط RTL للغة العربية
- **Focus Management**: تحسين إدارة التركيز
- **Mobile Support**: تحسين الدعم للأجهزة المحمولة

### 📝 Documentation
- **Usage Examples**: إضافة أمثلة شاملة للاستخدام
- **API Reference**: تحديث مرجع API
- **Migration Guide**: دليل الترحيل من الإصدار السابق

## [1.0.0] - Previous Version

### ✨ Initial Features
- Basic select functionality
- Multiple selection support
- Custom styling
- Error handling
- Icon support
- Disabled state
- Form integration

---

## Migration Guide

### من الإصدار 1.0.0 إلى 2.0.0

لا توجد تغييرات مطلوبة للكود الموجود. جميع الخصائص السابقة تعمل كما هي.

#### لتفعيل البحث:

```tsx
// الإصدار السابق
<CustomSelect
  label="اختر خياراً"
  value={value}
  onChange={onChange}
  options={options}
/>

// الإصدار الجديد مع البحث
<CustomSelect
  label="اختر خياراً"
  value={value}
  onChange={onChange}
  options={options}
  searchable={true}  // إضافة هذه الخاصية فقط
  placeholder="ابحث..."  // اختياري
/>
```

### Breaking Changes
لا توجد تغييرات كاسرة في هذا الإصدار.

### Deprecations
لا توجد ميزات مهجورة في هذا الإصدار. 