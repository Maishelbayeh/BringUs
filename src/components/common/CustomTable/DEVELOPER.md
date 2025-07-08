# Developer Guide - CustomTable Component

## Quick Start

```tsx
import { CustomTable } from '@/components/common/CustomTable';

const MyComponent = () => {
  const columns = [
    { key: 'name', label: { en: 'Name', ar: 'الاسم' } },
    { key: 'image', label: { en: 'Image', ar: 'الصورة' }, type: 'image' }
  ];

  const data = [
    { name: 'Product 1', image: '/image1.jpg' }
  ];

  return (
    <CustomTable
      columns={columns}
      data={data}
      onEdit={(item) => console.log('Edit:', item)}
      onDelete={(item) => console.log('Delete:', item)}
    />
  );
};
```

## Component Architecture

### Main Components
- `CustomTable`: المكون الرئيسي
- `TableHeader`: رأس الجدول مع الترتيب والفلترة
- `TableRow`: صف الجدول
- `TableCell`: خلية الجدول مع معالجة أنواع البيانات
- `TablePagination`: ترقيم الصفحات
- `TableFilter`: نافذة الفلترة المنبثقة
- `TableActions`: أزرار الإجراءات (تصدير)
- `ImageModal`: مودال عرض الصور
- `SearchBar`: شريط البحث
- `ActiveFilters`: الفلاتر النشطة

### Key Features
- ✅ **Modular Design**: كل مكون منفصل وقابل لإعادة الاستخدام
- ✅ **TypeScript Support**: دعم كامل لـ TypeScript
- ✅ **RTL Support**: دعم اللغة العربية
- ✅ **Responsive**: متجاوب مع جميع الأجهزة
- ✅ **Accessible**: متوافق مع معايير إمكانية الوصول
- ✅ **Customizable**: قابل للتخصيص بسهولة

## Styling

الأنماط موجودة في `styles.css` وتشمل:
- تأثيرات hover للصفوف
- أنماط مخصصة للصور
- تأثيرات للفلاتر والترقيم
- دعم RTL
- تصميم متجاوب

## Adding New Column Types

لإضافة نوع عمود جديد:

1. أضف النوع إلى `types.ts`:
```tsx
type ColumnType = 'text' | 'number' | 'date' | 'image' | 'color' | 'link' | 'status' | 'custom';
```

2. أضف المعالجة في `TableCell.tsx`:
```tsx
case 'custom':
  return renderCustom(value, item);
```

## Performance Tips

- استخدم `React.memo` للمكونات الفرعية إذا لزم الأمر
- تجنب إعادة إنشاء الكائنات في props
- استخدم `useCallback` للدوال الممررة كـ props
- استخدم `useMemo` للبيانات المحسوبة

## Testing

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm test -- --coverage
```

## Contributing

1. اتبع نمط الكود الموجود
2. أضف اختبارات للميزات الجديدة
3. حدث التوثيق
4. تأكد من عمل المكون مع RTL
5. اختبر الأداء

## Troubleshooting

### مشاكل شائعة:
- **الصور لا تظهر**: تأكد من وجود ملف placeholder-image.png
- **مشاكل RTL**: تأكد من إعداد i18n بشكل صحيح
- **أخطاء TypeScript**: تأكد من تحديث الأنواع في types.ts 