# CustomTable Component v2.0.0

مكون جدول مخصص ومتطور مع دعم كامل للغة العربية والإنجليزية، مصمم لتوفير تجربة مستخدم ممتازة مع أداء عالي.

## 🚀 المميزات الرئيسية

- ✅ **فلترة متقدمة**: دعم فلترة النصوص والتواريخ والأرقام
- ✅ **ترتيب ذكي**: ترتيب حسب نوع البيانات (نصي/رقمي)
- ✅ **بحث شامل**: بحث في جميع الأعمدة
- ✅ **عرض الصور المحسن**: مع مودال مخصص لعرض الصور
- ✅ **تصدير البيانات**: دعم تصدير Excel و CSV
- ✅ **ترقيم الصفحات**: مع واجهة مستخدم محسنة
- ✅ **دعم RTL**: دعم كامل للغة العربية
- ✅ **مكونات منفصلة**: هيكل مرن وقابل للتخصيص
- ✅ **أداء محسن**: تحسين الأداء من خلال المكونات المنفصلة
- ✅ **تصميم متجاوب**: يعمل على جميع الأجهزة
- ✅ **إظهار/إخفاء الأعمدة**: إمكانية إخفاء وإظهار الأعمدة بشكل فردي أو جماعي

## 📦 التثبيت

```bash
# المكون مدمج في المشروع
# لا حاجة لتثبيت إضافي
```

## 🎯 الاستخدام السريع

```tsx
import { CustomTable } from '@/components/common/CustomTable';

const MyComponent = () => {
  const columns = [
    {
      key: 'id',
      label: { en: 'ID', ar: 'الرقم' },
      type: 'number'
    },
    {
      key: 'name',
      label: { en: 'Name', ar: 'الاسم' },
      type: 'text'
    },
    {
      key: 'image',
      label: { en: 'Image', ar: 'الصورة' },
      type: 'image'
    },
    {
      key: 'status',
      label: { en: 'Status', ar: 'الحالة' },
      type: 'status'
    }
  ];

  const data = [
    { id: 1, name: 'Product 1', image: '/image1.jpg', status: 'Active' },
    { id: 2, name: 'Product 2', image: '/image2.jpg', status: 'Inactive' }
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

## 🏗️ هيكل المكونات

```
CustomTable/
├── index.ts              # التصدير الرئيسي
├── types.ts              # أنواع TypeScript
├── CustomTable.tsx       # المكون الرئيسي
├── TableHeader.tsx       # رأس الجدول
├── TableRow.tsx          # صف الجدول
├── TableCell.tsx         # خلية الجدول
├── TablePagination.tsx   # ترقيم الصفحات
├── TableFilter.tsx       # نافذة الفلترة
├── TableActions.tsx      # أزرار الإجراءات
├── ImageModal.tsx        # مودال الصور
├── SearchBar.tsx         # شريط البحث
├── ActiveFilters.tsx     # الفلاتر النشطة
├── styles.css            # الأنماط المخصصة
├── README.md             # التوثيق
├── CHANGELOG.md          # سجل التحديثات
├── DEVELOPER.md          # دليل المطور
├── package.json          # معلومات الحزمة
└── example.tsx           # مثال الاستخدام
```

## 📋 أنواع الأعمدة المدعومة

### `text` - نص عادي
```tsx
{
  key: 'name',
  label: { en: 'Name', ar: 'الاسم' },
  type: 'text'
}
```

### `number` - أرقام
```tsx
{
  key: 'price',
  label: { en: 'Price', ar: 'السعر' },
  type: 'number',
  align: 'right'
}
```

### `date` - تواريخ
```tsx
{
  key: 'createdAt',
  label: { en: 'Created At', ar: 'تاريخ الإنشاء' },
  type: 'date'
}
```

### `image` - صور
```tsx
{
  key: 'image',
  label: { en: 'Image', ar: 'الصورة' },
  type: 'image'
}
```

### `color` - ألوان
```tsx
{
  key: 'color',
  label: { en: 'Color', ar: 'اللون' },
  type: 'color'
}
```

### `status` - حالات
```tsx
{
  key: 'status',
  label: { en: 'Status', ar: 'الحالة' },
  type: 'status'
}
```

### `link` - روابط
```tsx
{
  key: 'name',
  label: { en: 'Name', ar: 'الاسم' },
  type: 'link'
}
```

## ⚙️ الخصائص (Props)

### CustomTableProps

| الخاصية | النوع | الوصف |
|---------|-------|--------|
| `columns` | `Column[]` | تعريف الأعمدة |
| `data` | `any[]` | البيانات المراد عرضها |
| `onEdit?` | `(item: any) => void` | دالة التعديل |
| `onDelete?` | `(item: any) => void` | دالة الحذف |
| `onFilteredDataChange?` | `(filtered: any[]) => void` | دالة تغيير البيانات المفلترة |
| `linkConfig?` | `LinkConfig[]` | إعدادات الروابط |
| `showColumnToggle?` | `boolean` | إظهار زر تبديل الأعمدة (افتراضي: false) |
| `showHiddenColumnsBar?` | `boolean` | إظهار شريط الأعمدة المخفية (افتراضي: true) |
| `autoScrollToFirst?` | `boolean` | التمرير التلقائي إلى العمود الأول (افتراضي: true) |
| `onColumnsChange?` | `(columns: Column[]) => void` | دالة تغيير الأعمدة |

### Column

| الخاصية | النوع | الوصف |
|---------|-------|--------|
| `key` | `string` | مفتاح العمود |
| `label` | `{ en: string; ar: string }` | عنوان العمود |
| `type?` | `ColumnType` | نوع العمود |
| `render?` | `(value: any, item: any) => React.ReactNode` | دالة التصميم المخصص |
| `align?` | `'left' \| 'center' \| 'right'` | محاذاة العمود |
| `hidden?` | `boolean` | إخفاء العمود افتراضياً |
| `hideable?` | `boolean` | إمكانية إخفاء العمود (افتراضي: true) |
| `showControls?` | `boolean` | إظهار أيقونات الترتيب والفلتر والرؤية (افتراضي: true) |

## 🎨 التخصيص

### تخصيص الأنماط

```css
/* تخصيص أنماط الجدول */
.custom-table-row:hover {
  background-color: #f3f4f6;
  transform: scale(1.01);
}

/* تخصيص أنماط الصور */
.table-image-container {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* تخصيص أنماط الفلاتر */
.active-filter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

### تخصيص المكونات الفردية

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

// استخدام المكونات الفردية
<SearchBar 
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
/>
```

## 🔧 الإعدادات المتقدمة

### إعدادات الروابط

```tsx
const linkConfig = [
  {
    column: 'name',
    getPath: (row) => `/products/${row.id}`
  }
];

<CustomTable
  columns={columns}
  data={data}
  linkConfig={linkConfig}
/>
```

### دالة التصميم المخصص

```tsx
const columns = [
  {
    key: 'actions',
    label: { en: 'Actions', ar: 'الإجراءات' },
    render: (value, item) => (
      <div className="flex gap-2">
        <button onClick={() => handleView(item)}>View</button>
        <button onClick={() => handleEdit(item)}>Edit</button>
      </div>
    )
  }
];
```

## 🌐 دعم اللغات

### العربية (RTL)
```tsx
// يتم التعامل مع RTL تلقائياً
// تأكد من إعداد i18n بشكل صحيح
```

### الإنجليزية (LTR)
```tsx
// الوضع الافتراضي
```

## 📱 التصميم المتجاوب

المكون متجاوب تلقائياً مع جميع أحجام الشاشات:
- **Desktop**: عرض كامل مع جميع الميزات
- **Tablet**: تحسين العرض للشاشات المتوسطة
- **Mobile**: عرض محسن للهواتف المحمولة

## 🚀 الأداء

### تحسينات الأداء المطبقة:
- مكونات منفصلة لتحسين إعادة التصميم
- استخدام `useMemo` و `useCallback` عند الحاجة
- تحسين معالجة البيانات الكبيرة
- تحسين عرض الصور

### نصائح لتحسين الأداء:
```tsx
// استخدام React.memo للمكونات الفرعية
const MemoizedTableCell = React.memo(TableCell);

// تجنب إعادة إنشاء الكائنات
const columns = useMemo(() => [
  // تعريف الأعمدة
], []);

// استخدام useCallback للدوال
const handleEdit = useCallback((item) => {
  // منطق التعديل
}, []);
```

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm test -- --coverage

# تشغيل الاختبارات في وضع المراقبة
npm test -- --watch
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### الصور لا تظهر
```bash
# تأكد من وجود ملف placeholder-image.png في مجلد public
public/placeholder-image.png
```

#### مشاكل RTL
```tsx
// تأكد من إعداد i18n بشكل صحيح
import i18n from 'i18next';

i18n.init({
  lng: 'ar', // للغة العربية
  fallbackLng: 'en'
});
```

#### أخطاء TypeScript
```tsx
// تأكد من تحديث الأنواع في types.ts
import { Column, CustomTableProps } from '@/components/common/CustomTable';
```

## 📚 أمثلة إضافية

### جدول مع فلترة متقدمة
```tsx
const columns = [
  { key: 'name', label: { en: 'Name', ar: 'الاسم' } },
  { key: 'category', label: { en: 'Category', ar: 'الفئة' } },
  { key: 'price', label: { en: 'Price', ar: 'السعر' }, type: 'number' },
  { key: 'createdAt', label: { en: 'Created', ar: 'تاريخ الإنشاء' }, type: 'date' }
];

<CustomTable
  columns={columns}
  data={products}
  onFilteredDataChange={(filtered) => setFilteredProducts(filtered)}
/>
```

### جدول مع إجراءات مخصصة
```tsx
const handleView = (item) => {
  window.open(`/products/${item.id}`, '_blank');
};

const handleDuplicate = (item) => {
  // منطق النسخ
};

const columns = [
  { key: 'name', label: { en: 'Name', ar: 'الاسم' } },
  {
    key: 'actions',
    label: { en: 'Actions', ar: 'الإجراءات' },
    render: (value, item) => (
      <div className="flex gap-2">
        <button onClick={() => handleView(item)}>View</button>
        <button onClick={() => handleDuplicate(item)}>Duplicate</button>
      </div>
    )
  }
];
```

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

### معايير الكود:
- اتبع نمط الكود الموجود
- أضف اختبارات للميزات الجديدة
- حدث التوثيق
- تأكد من عمل المكون مع RTL
- اختبر الأداء

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للدعم والاستفسارات:
- إنشاء Issue في GitHub
- مراجعة التوثيق
- فحص الأمثلة

---

**تم تطوير هذا المكون بواسطة فريق BringUs** 🚀 

## 👁️ إظهار/إخفاء الأعمدة

### الاستخدام الأساسي

```tsx
const columns = [
  {
    key: 'id',
    label: { en: 'ID', ar: 'الرقم' },
    type: 'number',
    hideable: true // يمكن إخفاؤه
  },
  {
    key: 'name',
    label: { en: 'Name', ar: 'الاسم' },
    type: 'text',
    hideable: false // لا يمكن إخفاؤه (مطلوب)
  },
  {
    key: 'price',
    label: { en: 'Price', ar: 'السعر' },
    type: 'number',
    hidden: true // مخفي افتراضياً
  }
];

<CustomTable
  columns={columns}
  data={data}
  showColumnToggle={true}
  onColumnsChange={(updatedColumns) => {
    console.log('Columns updated:', updatedColumns);
  }}
/>
```

### إخفاء الأعمدة الفردي

- **أيقونة العين المفتوحة**: العمود مرئي - انقر لإخفائه
- **أيقونة العين المغلقة**: العمود مخفي - انقر لإظهاره
- **الأعمدة المطلوبة**: لا تحتوي على أيقونة عين (hideable: false)

### إدارة الأعمدة الجماعية

زر تبديل الأعمدة يوفر:
- **Select All**: إظهار جميع الأعمدة
- **Select None**: إخفاء جميع الأعمدة القابلة للإخفاء
- **Reset**: إعادة تعيين إلى الحالة الافتراضية

### شريط الأعمدة المخفية

عند إخفاء الأعمدة، يظهر شريط في الأعلى يعرض جميع الأعمدة المخفية:

```tsx
<CustomTable
  columns={columns}
  data={data}
  showHiddenColumnsBar={true} // إظهار شريط الأعمدة المخفية
  showColumnToggle={true}
/>
```

**مميزات شريط الأعمدة المخفية:**
- **عرض الأعمدة المخفية**: يظهر قائمة بجميع الأعمدة المخفية
- **إعادة الإظهار السريع**: انقر على أي عمود لإعادة إظهاره
- **تصميم أنيق**: أزرار دائرية مع أيقونات عين
- **إخفاء تلقائي**: يختفي عندما لا توجد أعمدة مخفية
- **دعم اللغات**: يعرض أسماء الأعمدة باللغة المحددة

### إخفاء أيقونات التحكم

يمكن إخفاء أيقونات الترتيب والفلتر والرؤية من أي عمود:

```tsx
const columns = [
  {
    key: 'name',
    label: { en: 'Name', ar: 'الاسم' },
    type: 'text',
    showControls: false // إخفاء جميع أيقونات التحكم
  },
  {
    key: 'actions',
    label: { en: 'Actions', ar: 'العمليات' },
    type: 'text',
    showControls: false, // عمود العمليات بدون أيقونات تحكم
    render: (value, item) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(item)}>Edit</button>
        <button onClick={() => handleDelete(item)}>Delete</button>
      </div>
    )
  }
];
```

### التمرير التلقائي إلى العمود الأول

يمكن تفعيل التمرير التلقائي إلى العمود الأول عند تغيير البيانات أو الفلاتر:

```tsx
<CustomTable
  columns={columns}
  data={data}
  autoScrollToFirst={true} // التمرير التلقائي إلى العمود الأول
/>
```

**متى يتم التمرير:**
- عند تغيير البيانات
- عند تغيير الفلاتر
- عند تغيير مصطلح البحث
- عند تغيير إظهار/إخفاء الأعمدة

**مميزات التمرير التلقائي:**
- **تجربة مستخدم محسنة**: المستخدم يرى دائماً العمود الأول
- **سهولة التنقل**: لا حاجة للتمرير يدوياً
- **قابلية التحكم**: يمكن إيقاف الميزة إذا لزم الأمر