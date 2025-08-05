import React, { useState, useEffect } from 'react';
import useLanguage from '@/hooks/useLanguage';
import { useStore } from '@/hooks/useStore';
import { useStoreSlider } from '@/hooks/useStoreSlider';
import { STORE_ID } from '@/constants/api';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import StoreSlider from '@/components/common/StoreSlider';

/**
 * مكون لعرض معلومات المتجر (للقراءة فقط) مع أقسام قابلة للطي
 */
const StoreView: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { getStore, loading, error } = useStore();
  const { storeSliders, loading: slidersLoading } = useStoreSlider();
  const [storeData, setStoreData] = useState<any>(null);
  
  // حالة الأقسام المطوية
  const [collapsedSections, setCollapsedSections] = useState<{
    basic: boolean;
    slider: boolean;
    contact: boolean;
    settings: boolean;
    social: boolean;
    additional: boolean;
  }>({
    basic: false,
    slider: false,
    contact: false,
    settings: false,
    social: false,
    additional: false
  });

  /**
   * تبديل حالة قسم معين
   */
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  /**
   * طي جميع الأقسام
   */
  const collapseAll = () => {
    setCollapsedSections({
      basic: true,
      slider: true,
      contact: true,
      settings: true,
      social: true,
      additional: true
    });
  };

  /**
   * فتح جميع الأقسام
   */
  const expandAll = () => {
    setCollapsedSections({
      basic: false,
      slider: false,
      contact: false,
      settings: false,
      social: false,
      additional: false
    });
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      if (STORE_ID) {
        const store = await getStore(STORE_ID);
        if (store) {
          setStoreData(store);
        }
      }
    };

    fetchStoreData();
  }, [getStore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isRTL ? 'جاري تحميل معلومات المتجر...' : 'Loading store information...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isRTL ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isRTL ? 'لا توجد بيانات متجر' : 'No Store Data'}
          </h3>
          <p className="text-gray-600">
            {isRTL ? 'لم يتم العثور على معلومات المتجر' : 'Store information not found'}
          </p>
        </div>
      </div>
    );
  }

  // تحويل logo من array إلى الشكل المتوقع
  let logoData = { public_id: null as string | null, url: null as string | null };
  if (Array.isArray(storeData.logo) && storeData.logo.length > 0) {
    logoData = {
      public_id: storeData.logo[0].key,
      url: storeData.logo[0].url
    };
  } else if (storeData.logo && typeof storeData.logo === 'object' && 'url' in storeData.logo) {
    logoData = storeData.logo as { public_id: string | null; url: string | null };
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="max-w-4xl mx-auto">
        {/* عنوان الصفحة */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'معلومات المتجر' : 'Store Information'}
          </h1>
          <p className={`text-gray-600 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'عرض تفاصيل المتجر الحالي' : 'View current store details'}
          </p>
        </div>

        {/* أزرار التحكم */}
        <div className={`mb-6 flex gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            {isRTL ? 'فتح الكل' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            {isRTL ? 'طي الكل' : 'Collapse All'}
          </button>
        </div>

        {/* بطاقة معلومات المتجر */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* رأس البطاقة مع اللوجو */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              {logoData.url && (
                <img 
                  src={logoData.url} 
                  alt="Store Logo" 
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {language === 'ARABIC' ? storeData.nameAr : storeData.nameEn}
                </h2>
                <p className="text-blue-100 mt-1">
                  {language === 'ARABIC' ? storeData.descriptionAr : storeData.descriptionEn}
                </p>
              </div>
            </div>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-6 space-y-4">
            {/* قسم المعلومات الأساسية */}
            <CollapsibleSection
              title={isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
              icon=""
              isCollapsed={collapsedSections.basic}
              onToggle={() => toggleSection('basic')}
              isRTL={isRTL}
            >
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'الاسم بالعربية:' : 'Name (Arabic):'}
                  </span>
                  <p className="text-gray-900">{storeData.nameAr}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'الاسم بالإنجليزية:' : 'Name (English):'}
                  </span>
                  <p className="text-gray-900">{storeData.nameEn}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'رابط المتجر:' : 'Store URL:'}
                  </span>
                  <p className="text-blue-600">{storeData.slug}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'الحالة:' : 'Status:'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    storeData.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {storeData.status === 'active' 
                      ? (isRTL ? 'نشط' : 'Active') 
                      : (isRTL ? 'غير نشط' : 'Inactive')
                    }
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* قسم صور السلايدر */}
            <CollapsibleSection
              title={isRTL ? 'صور السلايدر' : 'Store Slider Images'}
              icon="🖼️"
              isCollapsed={collapsedSections.slider}
              onToggle={() => toggleSection('slider')}
              isRTL={isRTL}
            >
              <div className="space-y-4">
                {slidersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      {isRTL ? 'جاري تحميل الصور...' : 'Loading images...'}
                    </span>
                  </div>
                ) : storeSliders && storeSliders.length > 0 ? (
                  <div className="space-y-6">
                    {/* عرض السلايدر الرئيسي */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        {isRTL ? 'سلايدر المتجر' : 'Store Slider'}
                      </h4>
                      <StoreSlider
                        images={storeSliders
                          .filter(slider => slider.type === 'slider' && slider.isActive && slider.imageUrl)
                          .sort((a, b) => a.order - b.order)
                          .map(slider => slider.imageUrl!)
                        }
                        autoPlay={true}
                        interval={4000}
                        showArrows={true}
                        showDots={true}
                        isRTL={isRTL}
                        className="w-full"
                      />
                    </div>

                    {/* عرض قائمة الصور الفردية */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        {isRTL ? 'جميع صور السلايدر' : 'All Slider Images'}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {storeSliders
                          .filter(slider => slider.type === 'slider' && slider.isActive && slider.imageUrl)
                          .sort((a, b) => a.order - b.order)
                          .map((slider, index) => (
                            <div key={slider._id} className="group relative">
                              <img
                                src={slider.imageUrl}
                                alt={slider.title || `Slider ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center p-2">
                                  <p className="text-sm font-medium truncate">
                                    {slider.title || `Slider ${index + 1}`}
                                  </p>
                                  {slider.description && (
                                    <p className="text-xs text-gray-200 mt-1 line-clamp-2">
                                      {slider.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {slider.order}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🖼️</div>
                    <p className="text-gray-600">
                      {isRTL ? 'لا توجد صور سلايدر متاحة' : 'No slider images available'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {isRTL ? 'قم بإضافة صور السلايدر من صفحة إدارة السلايدر' : 'Add slider images from the slider management page'}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* قسم معلومات التواصل */}
            <CollapsibleSection
              title={isRTL ? 'معلومات التواصل' : 'Contact Information'}
              icon="📞"
              isCollapsed={collapsedSections.contact}
              onToggle={() => toggleSection('contact')}
              isRTL={isRTL}
            >
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'البريد الإلكتروني:' : 'Email:'}
                  </span>
                  <p className="text-gray-900">{storeData.contact?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'رقم الهاتف:' : 'Phone:'}
                  </span>
                  <p className="text-gray-900">{storeData.contact?.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'رقم الواتساب:' : 'WhatsApp:'}
                  </span>
                  <p className="text-gray-900">{storeData.whatsappNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {isRTL ? 'العنوان:' : 'Address:'}
                  </span>
                  <p className="text-gray-900">
                    {storeData.contact?.address?.street}, {storeData.contact?.address?.city}, {storeData.contact?.address?.state}
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* قسم إعدادات المتجر */}
            <CollapsibleSection
              title={isRTL ? 'إعدادات المتجر' : 'Store Settings'}
              icon="⚙️"
              isCollapsed={collapsedSections.settings}
              onToggle={() => toggleSection('settings')}
              isRTL={isRTL}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-sm font-medium text-gray-500">
                    {isRTL ? 'اللون الرئيسي' : 'Main Color'}
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mt-2 border-2 border-gray-300"
                    style={{ backgroundColor: storeData.settings?.mainColor }}
                  ></div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium text-gray-500">
                    {isRTL ? 'نسبة الخصم' : 'Discount'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {storeData.settings?.storeDiscount}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-gray-500">
                    {isRTL ? 'نسبة الضريبة' : 'Tax Rate'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {storeData.settings?.taxRate}%
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="text-sm font-medium text-gray-500">
                    {isRTL ? 'الشحن' : 'Shipping'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {storeData.settings?.shippingEnabled 
                      ? (isRTL ? 'مفعل' : 'Enabled') 
                      : (isRTL ? 'معطل' : 'Disabled')
                    }
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* قسم السوشال ميديا */}
            {storeData.settings?.storeSocials && (
              <CollapsibleSection
                title={isRTL ? 'السوشال ميديا' : 'Social Media'}
                icon="📱"
                isCollapsed={collapsedSections.social}
                onToggle={() => toggleSection('social')}
                isRTL={isRTL}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(storeData.settings.storeSocials).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <div key={platform} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">
                          {platform === 'facebook' && '📘'}
                          {platform === 'instagram' && '📷'}
                          {platform === 'twitter' && '🐦'}
                          {platform === 'youtube' && '📺'}
                          {platform === 'linkedin' && '💼'}
                          {platform === 'telegram' && '📱'}
                          {platform === 'snapchat' && '👻'}
                          {platform === 'pinterest' && '📌'}
                          {platform === 'tiktok' && '🎵'}
                        </span>
                        <a 
                          href={url as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm truncate"
                        >
                          {platform}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* قسم المعلومات الإضافية */}
            <CollapsibleSection
              title={isRTL ? 'معلومات إضافية' : 'Additional Information'}
              icon="📅"
              isCollapsed={collapsedSections.additional}
              onToggle={() => toggleSection('additional')}
              isRTL={isRTL}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">
                    {isRTL ? 'تاريخ الإنشاء:' : 'Created:'}
                  </span>
                  <span className="ml-2">
                    {new Date(storeData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">
                    {isRTL ? 'آخر تحديث:' : 'Last Updated:'}
                  </span>
                  <span className="ml-2">
                    {new Date(storeData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreView; 