# BringUs - React Admin Dashboard

نظام إدارة متكامل مبني بـ React مع دعم كامل للغة العربية والإنجليزية.

## 🚀 المميزات

- ✅ **واجهة إدارة متكاملة**: نظام إدارة شامل للمنتجات والعملاء والطلبات
- ✅ **دعم متعدد اللغات**: العربية والإنجليزية مع دعم RTL
- ✅ **مكونات قابلة لإعادة الاستخدام**: مكتبة مكونات غنية
- ✅ **تصميم متجاوب**: يعمل على جميع الأجهزة
- ✅ **أداء عالي**: محسن للأداء والسرعة
- ✅ **سهولة الاستخدام**: واجهة مستخدم بديهية

## 📦 التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-username/BringUs.git

# الانتقال إلى المجلد
cd BringUs

# تثبيت التبعيات
npm install

# تشغيل المشروع
npm run dev
```

## 🏗️ هيكل المشروع

```
BringUs/
├── src/
│   ├── components/          # المكونات
│   │   ├── common/         # المكونات المشتركة
│   │   │   ├── CustomTable/ # جدول مخصص متطور
│   │   │   └── ...
│   │   └── pages/          # صفحات التطبيق
│   ├── hooks/              # React Hooks
│   ├── store/              # إدارة الحالة
│   ├── utils/              # أدوات مساعدة
│   └── localization/       # ملفات الترجمة
├── public/                 # الملفات العامة
└── docs/                   # التوثيق
```

## 🎯 المكونات الرئيسية

### CustomTable - الجدول المخصص
جدول متطور مع دعم الفلترة والترتيب والبحث:

```tsx
import { CustomTable } from '@/components/common/CustomTable';

const columns = [
  { key: 'name', label: { en: 'Name', ar: 'الاسم' } },
  { key: 'image', label: { en: 'Image', ar: 'الصورة' }, type: 'image' }
];

<CustomTable columns={columns} data={data} />
```

**المميزات:**
- فلترة متقدمة
- ترتيب ذكي
- عرض الصور المحسن
- تصدير Excel/CSV
- دعم RTL
- تصميم متجاوب

## 🌐 دعم اللغات

### العربية
```tsx
// يتم التعامل مع RTL تلقائياً
i18n.changeLanguage('ar');
```

### الإنجليزية
```tsx
// الوضع الافتراضي
i18n.changeLanguage('en');
```

## 🎨 التصميم

المشروع يستخدم:
- **Tailwind CSS**: للتصميم
- **Heroicons**: للأيقونات
- **React Router**: للتنقل
- **React i18next**: للترجمة

## 📱 التصميم المتجاوب

- **Desktop**: عرض كامل مع جميع الميزات
- **Tablet**: تحسين العرض للشاشات المتوسطة
- **Mobile**: عرض محسن للهواتف المحمولة

## 🚀 الأداء

### تحسينات الأداء:
- مكونات منفصلة
- تحميل كسول للصفحات
- تحسين الصور
- إدارة ذكية للحالة

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm test -- --coverage
```

## 📦 البناء

```bash
# بناء للمنتج
npm run build

# معاينة البناء
npm run preview
```

## 🔧 التطوير

```bash
# تشغيل في وضع التطوير
npm run dev

# تشغيل في وضع المراقبة
npm run dev -- --watch
```

## 📚 التوثيق

- [دليل المطور](./src/components/common/CustomTable/DEVELOPER.md)
- [أمثلة الاستخدام](./src/components/common/CustomTable/example.tsx)
- [سجل التحديثات](./src/components/common/CustomTable/CHANGELOG.md)

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للدعم والاستفسارات:
- إنشاء Issue في GitHub
- مراجعة التوثيق
- فحص الأمثلة

---

**تم تطوير هذا المشروع بواسطة فريق BringUs** 🚀
