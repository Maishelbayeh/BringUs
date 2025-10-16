# 🚀 دليل نشر المشروع على Render

## ✅ التحسينات المطبقة

تم تحديث `server.js` و `render.yaml` لحل مشكلة 503 Error:

### 1. تحسينات server.js
- ✅ إضافة **Health Check Endpoint** على `/health`
- ✅ **التحقق من وجود مجلد dist** قبل بدء السيرفر
- ✅ **معالجة أخطاء أفضل** مع رسائل توضيحية
- ✅ **Logging لكل الطلبات** لتتبع المشاكل
- ✅ **Graceful Shutdown** عند إيقاف السيرفر

### 2. تحديث render.yaml
- ✅ تغيير `healthCheckPath` من `/` إلى `/health`

---

## 🔍 خطوات استكشاف الأخطاء

### الخطوة 1️⃣: تحقق من اللوجات (Logs) في Render

بعد النشر، افتح Dashboard → Logs في Render وابحث عن:

```bash
🔍 Checking paths:
   __dirname: /opt/render/project/src
   dist path: /opt/render/project/src/dist
   dist exists: true/false   ⬅️ يجب أن يكون true
   index.html exists: true/false  ⬅️ يجب أن يكون true
```

#### ❌ إذا ظهرت رسالة "dist directory not found":

**السبب:** فشل أمر البناء (`npm run build`)

**الحل:**
1. تحقق من أن أمر البناء ناجح في Render Logs:
   ```bash
   > npm run build
   ✓ built in 45s
   ```

2. إذا فشل البناء، قد يكون بسبب:
   - **نقص الذاكرة** (Memory limit على Free Plan)
   - **أخطاء في TypeScript** (تأكد من `npm run build` يعمل محلياً)
   - **Dependencies ناقصة**

---

### الخطوة 2️⃣: اختبر محلياً قبل النشر

```bash
# 1. نظف المشروع
rm -rf node_modules dist

# 2. أعد تثبيت Dependencies
npm install

# 3. جرب البناء
npm run build

# 4. تحقق من وجود مجلد dist
ls -la dist/

# 5. جرب السيرفر محلياً
npm start
```

إذا نجح كل شيء محلياً، فالمشكلة في Render.

---

### الخطوة 3️⃣: حلول مشاكل الذاكرة (Memory Issues)

إذا كان البناء يفشل بسبب الذاكرة على Free Plan:

**الحل 1: تقليل حجم البناء**

عدّل `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    sourcemap: false,  // أوقف sourcemaps في الإنتاج
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // قلل عدد الـ chunks
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

**الحل 2: زيادة حد الذاكرة في package.json**

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' tsc && vite build"
  }
}
```

---

### الخطوة 4️⃣: تحديث إعدادات Render يدوياً

إذا لم يعمل `render.yaml`، اذهب إلى Dashboard:

1. **Build Command:**
   ```bash
   npm install && npm run build
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (اختياري)

4. **Health Check Path:**
   ```
   /health
   ```

---

### الخطوة 5️⃣: اختبر Health Check

بعد النشر، جرب الوصول إلى:

```
https://bringus.onrender.com/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T...",
  "service": "bringus-frontend"
}
```

✅ إذا نجح → السيرفر يعمل وجاهز  
❌ إذا فشل → ارجع إلى اللوجات

---

## 🎯 الأخطاء الشائعة وحلولها

### 1. خطأ 503 بعد البناء الناجح

**الأسباب:**
- مجلد `dist` غير موجود (فشل البناء بصمت)
- السيرفر يبدأ قبل اكتمال البناء
- مشكلة في قراءة ملف `index.html`

**الحل:**
استخدم اللوجات للتحقق من رسائل السيرفر الجديدة.

---

### 2. خطأ "Cannot find module"

**السبب:** Dependencies ناقصة في `package.json`

**الحل:**
```bash
# تأكد من أن express موجود في dependencies (وليس devDependencies)
npm install express --save
```

تحقق من `package.json`:
```json
{
  "dependencies": {
    "express": "^4.21.2"  ✅
  }
}
```

---

### 3. الصفحة تظهر بيضاء (Blank Page)

**السبب:** مشكلة في مسارات React Router أو API

**الحل:**
1. افتح Console في المتصفح (F12)
2. ابحث عن أخطاء JavaScript
3. تأكد من أن جميع الملفات الثابتة تُحمّل بنجاح (Network Tab)

---

## 📝 Checklist قبل النشر

- [ ] `npm run build` يعمل محلياً بدون أخطاء
- [ ] مجلد `dist` يتم إنشاؤه بنجاح
- [ ] `npm start` يعمل محلياً
- [ ] ملف `package.json` يحتوي على `"start": "node server.js"`
- [ ] `express` موجود في `dependencies` (وليس `devDependencies`)
- [ ] متغيرات البيئة محددة في Render Dashboard
- [ ] Health Check Path = `/health`

---

## 🆘 إذا لم يعمل شيء

### استخدم Static Site بدلاً من Web Service

إذا استمرت المشاكل، يمكنك نشر المشروع كـ **Static Site**:

1. في Render Dashboard، اختر **New Static Site**
2. اربط مستودع GitHub
3. إعدادات البناء:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

✅ هذا الحل أبسط ولا يحتاج `server.js`  
❌ لكنه لا يدعم Server-Side Logic (إذا كنت تحتاجها)

---

## 📞 دعم إضافي

للحصول على مساعدة، ارسل:
1. لوجات Render كاملة (من Build و Runtime)
2. رسالة الخطأ الدقيقة (503, 500, إلخ)
3. رابط المشروع على Render

---

**تم التحديث:** 2025-10-16  
**النسخة:** 2.0

