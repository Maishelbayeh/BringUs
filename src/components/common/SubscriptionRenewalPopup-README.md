# Subscription Renewal Popup

## نظرة عامة
مكون popup لتجديد الاشتراك باستخدام TAP Payment Gateway API.

## الميزات
- ✅ نموذج دفع شامل مع جميع الحقول المطلوبة
- ✅ دعم العملات المتعددة (USD, ILS, JOD)
- ✅ تحويل تلقائي للمبالغ إلى الوحدات الصغيرة المطلوبة
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ عرض تفاصيل الاشتراك الحالي
- ✅ مؤشرات بصرية لحالة الاشتراك
- ✅ معالجة الأخطاء والنجاح
- ✅ تصميم متجاوب

## API المستخدم
- **Base URL**: `https://api.tap.company/v2`
- **Endpoint**: `/charges`
- **Secret Key**: `sk_test_aJgxg75kYKtW6qVuTgijJyzpuhszRSvc4`

## الحقول المطلوبة
- `amount*` - المبلغ (يتم تحويله تلقائياً)
- `email*` - البريد الإلكتروني
- `currency*` - العملة (ILS, JOD, USD)
- `first_name*` - الاسم الأول
- `last_name*` - الاسم الأخير
- `callback_url` - رابط العودة (http://localhost:5173/)
- `metadata` - بيانات إضافية (storeId, userId)

## تحويل العملات
- **ILS**: 1 ILS = 100 aghora
- **JOD**: 1 JOD = 100 qirsh  
- **USD**: 1 USD = 100 cents

## الاستخدام
```tsx
import SubscriptionRenewalPopup from './components/common/SubscriptionRenewalPopup';

<SubscriptionRenewalPopup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  isRTL={language === 'ARABIC'}
  storeId="your-store-id"
  userId="your-user-id"
/>
```

## الملفات المرتبطة
- `src/components/common/SubscriptionRenewalPopup.tsx` - المكون الرئيسي
- `src/components/common/SubscriptionDetails.tsx` - تفاصيل الاشتراك
- `src/hooks/useSubscription.ts` - إدارة حالة الاشتراك
- `src/hooks/useUserStore.ts` - بيانات المستخدم والمتجر
- `src/constants/payment.ts` - ثوابت API الدفع
- `src/localization/en.json` - الترجمات الإنجليزية
- `src/localization/ar.json` - الترجمات العربية

## التحديثات المستقبلية
- [ ] ربط مع API حقيقي لجلب بيانات الاشتراك
- [ ] إضافة خطط اشتراك مختلفة
- [ ] دعم المزيد من بوابات الدفع
- [ ] إضافة إشعارات push
- [ ] تتبع تاريخ المدفوعات
