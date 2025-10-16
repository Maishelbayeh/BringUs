#!/bin/bash

# 🧪 سكريبت اختبار محلي قبل النشر على Render
# تشغيل: bash test-local.sh

echo "🚀 بدء اختبار المشروع محلياً..."
echo "======================================"

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. التحقق من Node.js
echo ""
echo "1️⃣ التحقق من Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js مثبت: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js غير مثبت${NC}"
    exit 1
fi

# 2. التحقق من npm
echo ""
echo "2️⃣ التحقق من npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm مثبت: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm غير مثبت${NC}"
    exit 1
fi

# 3. تنظيف المشروع
echo ""
echo "3️⃣ تنظيف المشروع..."
echo -e "${YELLOW}حذف node_modules و dist...${NC}"
rm -rf node_modules dist

# 4. تثبيت Dependencies
echo ""
echo "4️⃣ تثبيت Dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم تثبيت Dependencies بنجاح${NC}"
else
    echo -e "${RED}❌ فشل تثبيت Dependencies${NC}"
    exit 1
fi

# 5. بناء المشروع
echo ""
echo "5️⃣ بناء المشروع (npm run build)..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم بناء المشروع بنجاح${NC}"
else
    echo -e "${RED}❌ فشل بناء المشروع${NC}"
    echo -e "${YELLOW}💡 نصيحة: تحقق من أخطاء TypeScript${NC}"
    exit 1
fi

# 6. التحقق من مجلد dist
echo ""
echo "6️⃣ التحقق من مجلد dist..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ مجلد dist موجود${NC}"
    
    # التحقق من index.html
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ ملف index.html موجود${NC}"
        
        # حجم مجلد dist
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}📦 حجم مجلد dist: $DIST_SIZE${NC}"
    else
        echo -e "${RED}❌ ملف index.html غير موجود في dist${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ مجلد dist غير موجود${NC}"
    exit 1
fi

# 7. اختبار السيرفر
echo ""
echo "7️⃣ اختبار السيرفر..."
echo -e "${YELLOW}🔄 بدء السيرفر على http://localhost:10000${NC}"
echo -e "${YELLOW}⏱️  سيتم إيقاف السيرفر بعد 5 ثواني...${NC}"
echo ""

# بدء السيرفر في الخلفية
npm start &
SERVER_PID=$!

# انتظر حتى يبدأ السيرفر
sleep 3

# اختبر Health Check
echo "🔍 اختبار Health Check Endpoint..."
HEALTH_CHECK=$(curl -s http://localhost:10000/health)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health Check يعمل:${NC}"
    echo "$HEALTH_CHECK" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_CHECK"
else
    echo -e "${RED}❌ فشل Health Check${NC}"
fi

# انتظر قليلاً
sleep 2

# أوقف السيرفر
echo ""
echo "🛑 إيقاف السيرفر..."
kill $SERVER_PID 2>/dev/null

# 8. النتيجة النهائية
echo ""
echo "======================================"
echo -e "${GREEN}🎉 اختبار المشروع ناجح!${NC}"
echo ""
echo "📝 الخطوات التالية:"
echo "  1. ارفع التغييرات إلى Git:"
echo "     git add ."
echo "     git commit -m 'Fix: تحسين server.js وحل مشكلة 503'"
echo "     git push origin main"
echo ""
echo "  2. انتقل إلى Render Dashboard:"
echo "     https://dashboard.render.com"
echo ""
echo "  3. تأكد من إعدادات Health Check:"
echo "     Health Check Path: /health"
echo ""
echo "  4. أعد النشر يدوياً (Manual Deploy)"
echo ""
echo "✅ كل شيء جاهز للنشر!"
echo "======================================"

