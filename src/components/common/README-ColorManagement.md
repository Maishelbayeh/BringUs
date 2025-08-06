# إدارة ألوان المنتجات - Color Management

## 📋 نظرة عامة

تم إضافة نظام متكامل لإدارة ألوان المنتجات في الواجهة الأمامية، يتوافق مع التحديثات الجديدة في الـ Backend.

## 🎨 المكونات المتاحة

### 1. ColorManager
مكون لإدارة ألوان المنتج (إضافة، تعديل، حذف)

#### الخصائص (Props):
```typescript
interface ColorManagerProps {
  productId: string;           // معرف المنتج
  currentColors?: string[][];  // الألوان الحالية
  onColorsChange?: (colors: string[][]) => void; // دالة التحديث
  readOnly?: boolean;          // وضع القراءة فقط
}
```

#### الاستخدام:
```tsx
import ColorManager from '../common/ColorManager';

<ColorManager
  productId="68803f60a83b761668fda72f"
  currentColors={[['#FF0000', '#0000FF'], ['#00FF00']]}
  onColorsChange={(colors) => console.log('Updated colors:', colors)}
  readOnly={false}
/>
```

### 2. ProductColorsDisplay
مكون لعرض ألوان المنتج (للقراءة فقط)

#### الخصائص (Props):
```typescript
interface ProductColorsDisplayProps {
  colors: string[][];          // الألوان المراد عرضها
  title?: string;              // العنوان (اختياري)
  showTitle?: boolean;         // إظهار العنوان (اختياري)
}
```

#### الاستخدام:
```tsx
import ProductColorsDisplay from '../common/ProductColorsDisplay';

<ProductColorsDisplay
  colors={[['#FF0000', '#0000FF'], ['#00FF00']]}
  title="ألوان المنتج"
  showTitle={true}
/>
```

## 🔧 الدوال المتاحة في useProducts

### إضافة ألوان
```typescript
const addColorsToProduct = async (productId: string, colors: string[][]): Promise<any>
```

### حذف ألوان
```typescript
const removeColorsFromProduct = async (productId: string, colorIndexes: number[]): Promise<any>
```

### استبدال جميع الألوان
```typescript
const replaceProductColors = async (productId: string, colors: string[][]): Promise<any>
```

### الحصول على ألوان المنتج
```typescript
const getProductColors = (product: any): string[][]
```

### إضافة لون واحد
```typescript
const addSingleColorToProduct = async (productId: string, color: string): Promise<any>
```

### إضافة عدة ألوان
```typescript
const addMultipleColorsToProduct = async (productId: string, colors: string[]): Promise<any>
```

## 📝 أمثلة الاستخدام

### مثال 1: إضافة ألوان جديدة
```typescript
import useProducts from '../../hooks/useProducts';

const { addColorsToProduct } = useProducts();

// إضافة مجموعة ألوان جديدة
await addColorsToProduct('68803f60a83b761668fda72f', [
  ['#FF0000', '#0000FF'],  // أحمر وأزرق
  ['#00FF00', '#FFFF00']   // أخضر وأصفر
]);
```

### مثال 2: حذف ألوان
```typescript
const { removeColorsFromProduct } = useProducts();

// حذف مجموعة الألوان الأولى والثالثة
await removeColorsFromProduct('68803f60a83b761668fda72f', [0, 2]);
```

### مثال 3: استبدال جميع الألوان
```typescript
const { replaceProductColors } = useProducts();

// استبدال جميع الألوان بألوان جديدة
await replaceProductColors('68803f60a83b761668fda72f', [
  ['#FF0000'],              // أحمر فقط
  ['#00FF00', '#0000FF']    // أخضر وأزرق
]);
```

### مثال 4: الحصول على ألوان المنتج
```typescript
const { getProductColors } = useProducts();

const product = { colors: '[["#FF0000","#0000FF"]]' };
const colors = getProductColors(product);
console.log(colors); // [['#FF0000', '#0000FF']]
```

## 🎯 تنسيق الألوان المدعوم

### Hex Colors
```typescript
'#FF0000'    // أحمر
'#00FF00'    // أخضر
'#0000FF'    // أزرق
'#FFFF00'    // أصفر
```

### RGB Colors
```typescript
'rgb(255, 0, 0)'      // أحمر
'rgb(0, 255, 0)'      // أخضر
'rgb(0, 0, 255)'      // أزرق
```

### RGBA Colors
```typescript
'rgba(255, 0, 0, 0.5)'    // أحمر شفاف
'rgba(0, 255, 0, 0.8)'    // أخضر شفاف
```

## 🔄 API Endpoints

### إضافة ألوان
```
POST /api/products/{productId}/colors
{
  "storeId": "687c9bb0a7b3f2a0831c4675",
  "colors": [["#FF0000", "#0000FF"]]
}
```

### حذف ألوان
```
DELETE /api/products/{productId}/colors
{
  "storeId": "687c9bb0a7b3f2a0831c4675",
  "colorIndexes": [0, 2]
}
```

### استبدال الألوان
```
PUT /api/products/{productId}/colors
{
  "storeId": "687c9bb0a7b3f2a0831c4675",
  "colors": [["#FF0000"], ["#00FF00", "#0000FF"]]
}
```

## 🎨 ميزات المكونات

### ColorManager
- ✅ إضافة مجموعات ألوان جديدة
- ✅ تعديل مجموعات الألوان الموجودة
- ✅ حذف مجموعات الألوان
- ✅ اختيار الألوان باستخدام Color Picker
- ✅ إدخال الألوان يدوياً
- ✅ التحقق من صحة الألوان
- ✅ عرض الألوان كـ Chips ملونة
- ✅ وضع القراءة فقط

### ProductColorsDisplay
- ✅ عرض مجموعات الألوان
- ✅ عرض الألوان كـ Chips ملونة
- ✅ تخطيط متجاوب (Responsive)
- ✅ إخفاء تلقائي إذا لم تكن هناك ألوان

## 🚀 التثبيت والمتطلبات

### المتطلبات:
```bash
npm install react-color @mui/material @mui/icons-material
```

### الاستيراد:
```typescript
import ColorManager from '../common/ColorManager';
import ProductColorsDisplay from '../common/ProductColorsDisplay';
import useProducts from '../../hooks/useProducts';
```

## 📱 الاستخدام في الصفحات

### في صفحة تفاصيل المنتج:
```tsx
import ColorManager from '../common/ColorManager';

function ProductDetails({ product }) {
  return (
    <div>
      <h1>{product.nameAr}</h1>
      <ColorManager
        productId={product._id}
        currentColors={product.colors}
        onColorsChange={(colors) => {
          // تحديث حالة الصفحة
        }}
      />
    </div>
  );
}
```

### في قائمة المنتجات:
```tsx
import ProductColorsDisplay from '../common/ProductColorsDisplay';

function ProductCard({ product }) {
  return (
    <Card>
      <CardContent>
        <h3>{product.nameAr}</h3>
        <ProductColorsDisplay 
          colors={product.colors} 
          showTitle={false}
        />
      </CardContent>
    </Card>
  );
}
```

## 🔧 التخصيص

### تخصيص الألوان الافتراضية:
```typescript
const defaultColors = [
  ['#FF0000', '#FF4444', '#FF8888'],  // درجات الأحمر
  ['#00FF00', '#44FF44', '#88FF88'],  // درجات الأخضر
  ['#0000FF', '#4444FF', '#8888FF']   // درجات الأزرق
];
```

### تخصيص التحقق من الألوان:
```typescript
const validateColor = (color: string): boolean => {
  // إضافة قواعد تحقق مخصصة
  const customRules = [
    color.length > 0,
    !color.includes(' '),
    // قواعد إضافية...
  ];
  return customRules.every(rule => rule);
};
```

## 🐛 استكشاف الأخطاء

### مشكلة: الألوان لا تظهر
```typescript
// تأكد من أن الألوان في التنسيق الصحيح
const colors = getProductColors(product);
console.log('Product colors:', colors);

// تأكد من أن المكون يتلقى البيانات
<ColorManager
  productId={product._id}
  currentColors={colors} // تأكد من تمرير الألوان
/>
```

### مشكلة: خطأ في API
```typescript
try {
  await addColorsToProduct(productId, colors);
} catch (error) {
  console.error('API Error:', error);
  // معالجة الخطأ
}
```

## 📈 التطوير المستقبلي

- [ ] دعم تدرجات الألوان (Gradients)
- [ ] دعم ألوان HSL
- [ ] حفظ الألوان المفضلة
- [ ] استيراد/تصدير مجموعات الألوان
- [ ] دعم الألوان المخصصة للمتاجر
- [ ] إحصائيات استخدام الألوان 