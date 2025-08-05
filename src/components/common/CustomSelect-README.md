# CustomSelect Component with Search Functionality

## نظرة عامة

تم تحديث مكون `CustomSelect` ليدعم إمكانية البحث في الخيارات. يمكن استخدام المكون في وضعين:
1. **وضع عادي** (بدون بحث) - مثل القوائم المنسدلة التقليدية
2. **وضع البحث** - مع إمكانية البحث والتصفية في الخيارات

## الميزات الجديدة

- ✅ **البحث في الخيارات**: إمكانية البحث في النص العربي والإنجليزي
- ✅ **تصفية تلقائية**: عرض الخيارات المطابقة فقط
- ✅ **واجهة محسنة**: تصميم حديث مع تأثيرات بصرية
- ✅ **دعم RTL**: متوافق مع اللغة العربية
- ✅ **إغلاق تلقائي**: إغلاق القائمة عند النقر خارجها
- ✅ **توافق كامل**: يحافظ على جميع الميزات السابقة

## الاستخدام

### القائمة العادية (بدون بحث)

```tsx
import CustomSelect from '../common/CustomSelect';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState('');
  
  const options = [
    { value: 'option1', label: 'الخيار الأول' },
    { value: 'option2', label: 'الخيار الثاني' },
    { value: 'option3', label: 'الخيار الثالث' },
  ];

  return (
    <CustomSelect
      label="اختر خياراً"
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
      options={options}
      placeholder="اختر من القائمة"
    />
  );
};
```

### القائمة مع البحث

```tsx
import CustomSelect from '../common/CustomSelect';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState('');
  
  const options = [
    { value: 'iphone', label: 'iPhone 15 Pro Max' },
    { value: 'samsung', label: 'Samsung Galaxy S24' },
    { value: 'macbook', label: 'MacBook Pro 16-inch' },
    // ... المزيد من الخيارات
  ];

  return (
    <CustomSelect
      label="اختر المنتج"
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
      options={options}
      searchable={true}
      placeholder="ابحث عن منتج..."
    />
  );
};
```

## الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|-------|-----------|-------|
| `label` | `string` | - | نص التسمية |
| `value` | `string \| string[]` | - | القيمة المختارة |
| `onChange` | `function` | - | دالة معالجة التغيير |
| `options` | `Option[]` | - | مصفوفة الخيارات |
| `id` | `string` | - | معرف العنصر |
| `icon` | `ReactNode` | - | أيقونة مخصصة |
| `className` | `string` | `''` | فئات CSS إضافية |
| `disabled` | `boolean` | `false` | تعطيل المكون |
| `error` | `string` | - | رسالة الخطأ |
| `multiple` | `boolean` | `false` | اختيار متعدد |
| `searchable` | `boolean` | `false` | تفعيل البحث |
| `placeholder` | `string` | - | النص الافتراضي |

## واجهة Option

```tsx
interface Option {
  value: string;
  label: string;
}
```

## الميزات المتقدمة

### الفواصل (Separators)

يمكن إضافة فواصل في القائمة باستخدام قيم تبدأ بـ `separator-`:

```tsx
const options = [
  { value: 'category1', label: 'الفئة الأولى' },
  { value: 'separator-1', label: '──────────' },
  { value: 'category2', label: 'الفئة الثانية' },
];
```

### التخصيص

يمكن تخصيص المظهر باستخدام فئات CSS:

```tsx
<CustomSelect
  className="my-custom-class"
  // ... باقي الخصائص
/>
```

## الترجمات

تم إضافة الترجمات التالية:

### الإنجليزية (en.json)
```json
{
  "common": {
    "search": "Search...",
    "noOptions": "No options found",
    "selectOption": "Select an option"
  }
}
```

### العربية (ar.json)
```json
{
  "common": {
    "search": "بحث...",
    "noOptions": "لا توجد خيارات",
    "selectOption": "اختر خياراً"
  }
}
```

## مثال كامل

راجع ملف `SearchableSelectExample.tsx` للحصول على مثال شامل للاستخدام.

## التوافق

- ✅ React 16.8+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ react-i18next
- ✅ RTL Support

## التحديثات المستقبلية

- [ ] دعم البحث المتقدم (بحث في القيم والنصوص)
- [ ] دعم التحميل التدريجي للخيارات
- [ ] دعم التجميع التلقائي
- [ ] دعم الاختيار المتعدد مع البحث 