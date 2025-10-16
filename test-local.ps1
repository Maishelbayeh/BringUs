# 🧪 سكريبت اختبار محلي قبل النشر على Render (PowerShell)
# تشغيل: .\test-local.ps1

Write-Host "`n🚀 بدء اختبار المشروع محلياً..." -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# 1. التحقق من Node.js
Write-Host "1️⃣ التحقق من Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js مثبت: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت" -ForegroundColor Red
    exit 1
}

# 2. التحقق من npm
Write-Host "`n2️⃣ التحقق من npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✅ npm مثبت: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm غير مثبت" -ForegroundColor Red
    exit 1
}

# 3. تنظيف المشروع
Write-Host "`n3️⃣ تنظيف المشروع..." -ForegroundColor Yellow
Write-Host "حذف node_modules و dist..." -ForegroundColor DarkYellow

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
Write-Host "✅ تم التنظيف" -ForegroundColor Green

# 4. تثبيت Dependencies
Write-Host "`n4️⃣ تثبيت Dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم تثبيت Dependencies بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل تثبيت Dependencies" -ForegroundColor Red
    exit 1
}

# 5. بناء المشروع
Write-Host "`n5️⃣ بناء المشروع (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بناء المشروع بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل بناء المشروع" -ForegroundColor Red
    Write-Host "💡 نصيحة: تحقق من أخطاء TypeScript" -ForegroundColor DarkYellow
    exit 1
}

# 6. التحقق من مجلد dist
Write-Host "`n6️⃣ التحقق من مجلد dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "✅ مجلد dist موجود" -ForegroundColor Green
    
    # التحقق من index.html
    if (Test-Path "dist\index.html") {
        Write-Host "✅ ملف index.html موجود" -ForegroundColor Green
        
        # حجم مجلد dist
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        $distSizeMB = [math]::Round($distSize / 1MB, 2)
        Write-Host "📦 حجم مجلد dist: $distSizeMB MB" -ForegroundColor Green
        
        # عدد الملفات
        $fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
        Write-Host "📁 عدد الملفات: $fileCount" -ForegroundColor Green
    } else {
        Write-Host "❌ ملف index.html غير موجود في dist" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ مجلد dist غير موجود" -ForegroundColor Red
    exit 1
}

# 7. اختبار السيرفر
Write-Host "`n7️⃣ اختبار السيرفر..." -ForegroundColor Yellow
Write-Host "🔄 بدء السيرفر على http://localhost:10000" -ForegroundColor DarkYellow
Write-Host "⏱️  سيتم اختبار السيرفر لمدة 5 ثواني...`n" -ForegroundColor DarkYellow

# بدء السيرفر في الخلفية
$serverJob = Start-Job -ScriptBlock { npm start }

# انتظر حتى يبدأ السيرفر
Start-Sleep -Seconds 3

# اختبر Health Check
Write-Host "🔍 اختبار Health Check Endpoint..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:10000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Health Check يعمل:" -ForegroundColor Green
    Write-Host ($healthCheck | ConvertTo-Json) -ForegroundColor Cyan
} catch {
    Write-Host "❌ فشل Health Check: $_" -ForegroundColor Red
}

# اختبر الصفحة الرئيسية
Write-Host "`n🔍 اختبار الصفحة الرئيسية..." -ForegroundColor Yellow
try {
    $homeResponse = Invoke-WebRequest -Uri "http://localhost:10000/" -Method Get -TimeoutSec 5
    if ($homeResponse.StatusCode -eq 200) {
        Write-Host "✅ الصفحة الرئيسية تعمل (Status: 200)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ فشل تحميل الصفحة الرئيسية: $_" -ForegroundColor Red
}

# انتظر قليلاً
Start-Sleep -Seconds 2

# أوقف السيرفر
Write-Host "`n🛑 إيقاف السيرفر..." -ForegroundColor Yellow
Stop-Job -Job $serverJob
Remove-Job -Job $serverJob

# 8. النتيجة النهائية
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "🎉 اختبار المشروع ناجح!" -ForegroundColor Green
Write-Host "`n📝 الخطوات التالية:" -ForegroundColor Yellow
Write-Host "  1. ارفع التغييرات إلى Git:" -ForegroundColor White
Write-Host "     git add ." -ForegroundColor Cyan
Write-Host "     git commit -m 'Fix: تحسين server.js وحل مشكلة 503'" -ForegroundColor Cyan
Write-Host "     git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. انتقل إلى Render Dashboard:" -ForegroundColor White
Write-Host "     https://dashboard.render.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. تأكد من إعدادات Health Check:" -ForegroundColor White
Write-Host "     Health Check Path: /health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. أعد النشر يدوياً (Manual Deploy)" -ForegroundColor White
Write-Host ""
Write-Host "✅ كل شيء جاهز للنشر!" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan

# فتح المتصفح للاختبار (اختياري)
$openBrowser = Read-Host "هل تريد فتح المتصفح للاختبار اليدوي؟ (y/n)"
if ($openBrowser -eq "y") {
    Write-Host "`n🔄 بدء السيرفر للاختبار اليدوي..." -ForegroundColor Yellow
    Write-Host "اضغط Ctrl+C لإيقاف السيرفر`n" -ForegroundColor DarkYellow
    Start-Process "http://localhost:10000"
    npm start
}

