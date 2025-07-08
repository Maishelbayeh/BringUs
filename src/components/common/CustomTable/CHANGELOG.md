# Changelog

## [2.1.0] - 2024-01-XX

### ✨ Added
- **إظهار/إخفاء الأعمدة الفردي**: إضافة أيقونات عين لكل عمود لإخفاء/إظهار الأعمدة مباشرة
- **تحسين واجهة الفلترة**: تحويل نافذة الفلترة إلى dropdown يظهر مباشرة تحت رأس العمود
- **إدارة الأعمدة المحسنة**: تحسين تجربة إدارة الأعمدة مع أيقونات واضحة
- **شريط الأعمدة المخفية**: شريط في الأعلى يعرض الأعمدة المخفية لإعادة إظهارها بسهولة
- **التحكم في أيقونات العمود**: إمكانية إخفاء أيقونات الترتيب والفلتر والرؤية من أي عمود
- **التمرير التلقائي إلى العمود الأول**: تمرير تلقائي إلى العمود الأول عند تغيير البيانات أو الفلاتر

### 🔧 Changed
- **موضع نافذة الفلترة**: تغيير من popup عائم إلى dropdown مدمج مع الجدول
- **تصميم أيقونات الأعمدة**: تحسين تصميم أيقونات الترتيب والفلترة والرؤية

### 🎨 UI/UX Improvements
- **أيقونات العين**: أيقونة عين مفتوحة للعمود المرئي، مغلقة للعمود المخفي
- **تلميحات تفاعلية**: إضافة tooltips لأيقونات إظهار/إخفاء الأعمدة
- **تصميم متسق**: تحسين التناسق البصري بين جميع أيقونات الأعمدة

## [2.0.0] - 2024-01-XX

### ✨ Added
- **مكونات منفصلة**: تقسيم الجدول إلى مكونات منفصلة وقابلة لإعادة الاستخدام
- **عرض الصور المحسن**: مودال مخصص لعرض الصور مع إمكانية التحميل
- **أنماط CSS مخصصة**: ملف CSS منفصل مع تأثيرات بصرية محسنة
- **معالجة أفضل للأخطاء**: معالجة أخطاء الصور والبيانات
- **دعم RTL محسن**: دعم أفضل للغة العربية
- **أداء محسن**: تحسين الأداء من خلال المكونات المنفصلة

### 🔧 Changed
- **هيكل الملفات**: إعادة تنظيم الملفات في مجلد منفصل
- **واجهة المستخدم**: تحسين التصميم والتفاعل
- **معالجة البيانات**: تحسين معالجة أنواع البيانات المختلفة
- **الفلترة**: تحسين نظام الفلترة والبحث

### 🐛 Fixed
- **مشاكل عرض الصور**: إصلاح مشاكل عرض الصور في الجدول
- **أخطاء TypeScript**: إصلاح أخطاء TypeScript
- **مشاكل RTL**: إصلاح مشاكل اتجاه النص للغة العربية
- **أخطاء الأداء**: تحسين الأداء وإصلاح مشاكل الذاكرة

### 📁 New File Structure
```
CustomTable/
├── index.ts              # Main exports
├── types.ts              # TypeScript types
├── CustomTable.tsx       # Main component
├── TableHeader.tsx       # Table header component
├── TableRow.tsx          # Table row component
├── TableCell.tsx         # Table cell component
├── TablePagination.tsx   # Pagination component
├── TableFilter.tsx       # Filter popup component
├── TableActions.tsx      # Actions menu component
├── ImageModal.tsx        # Image modal component
├── SearchBar.tsx         # Search bar component
├── ActiveFilters.tsx     # Active filters component
├── styles.css            # Custom styles
├── README.md             # Documentation
├── CHANGELOG.md          # This file
└── example.tsx           # Usage example
```

### 🎨 New Features
- **Image Modal**: مودال مخصص لعرض الصور مع إمكانية التحميل
- **Enhanced Styling**: أنماط CSS محسنة مع تأثيرات بصرية
- **Better Error Handling**: معالجة أفضل للأخطاء
- **Improved Accessibility**: تحسين إمكانية الوصول
- **Responsive Design**: تصميم متجاوب للأجهزة المحمولة

### 🔄 Migration Guide
للتحديث من الإصدار السابق:

1. **تحديث الاستيراد**:
```tsx
// القديم
import CustomTable from '@/components/common/CustomTable';

// الجديد
import { CustomTable } from '@/components/common/CustomTable';
```

2. **استيراد الأنواع**:
```tsx
import { Column, CustomTableProps } from '@/components/common/CustomTable';
```

3. **استيراد المكونات الفردية** (اختياري):
```tsx
import { 
  SearchBar, 
  TableActions, 
  TableHeader,
  TableRow,
  TableCell,
  TablePagination,
  TableFilter,
  ImageModal,
  ActiveFilters
} from '@/components/common/CustomTable';
```

### 📚 Documentation
- إضافة ملف README شامل
- إضافة أمثلة للاستخدام
- توثيق جميع المكونات والأنواع
- إرشادات التخصيص

### 🧪 Testing
- تحسين اختبارات المكونات
- إضافة اختبارات للأنماط
- اختبارات الأداء
- اختبارات إمكانية الوصول 