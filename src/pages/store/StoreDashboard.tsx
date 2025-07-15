import React, { useState } from 'react';
import StoreGeneralInfo from './StoreGeneralInfo';
import useLanguage from '@/hooks/useLanguage';

/**
 * تبويبات لوحة تحكم المتجر
 */
const TABS = [
  {
    id: 'general',
    labelAr: 'المعلومات العامة',
    labelEn: 'General Information',
    icon: '🏪'
  },
  {
    id: 'settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: '⚙️'
  },
  {
    id: 'social',
    labelAr: 'السوشال ميديا',
    labelEn: 'Social Media',
    icon: '📱'
  },
  {
    id: 'contact',
    labelAr: 'معلومات التواصل',
    labelEn: 'Contact Info',
    icon: '📞'
  }
];

/**
 * صفحة لوحة تحكم المتجر
 * تحتوي على تبويبات للتنقل بين أقسام مختلفة
 */
const StoreDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const [activeTab, setActiveTab] = useState('general');

  /**
   * عرض المحتوى حسب التبويب النشط
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <StoreGeneralInfo />;
      case 'settings':
        return (
          <div className={`text-center py-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isRTL ? 'إعدادات المتجر' : 'Store Settings'}
            </h3>
            <p className="text-gray-600">
              {isRTL ? 'سيتم إضافة إعدادات المتجر هنا قريباً' : 'Store settings will be added here soon'}
            </p>
          </div>
        );
      case 'social':
        return (
          <div className={`text-center py-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isRTL ? 'السوشال ميديا' : 'Social Media'}
            </h3>
            <p className="text-gray-600">
              {isRTL ? 'سيتم إضافة إدارة السوشال ميديا هنا قريباً' : 'Social media management will be added here soon'}
            </p>
          </div>
        );
      case 'contact':
        return (
          <div className={`text-center py-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isRTL ? 'معلومات التواصل' : 'Contact Information'}
            </h3>
            <p className="text-gray-600">
              {isRTL ? 'سيتم إضافة معلومات التواصل هنا قريباً' : 'Contact information will be added here soon'}
            </p>
          </div>
        );
      default:
        return <StoreGeneralInfo />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* رأس الصفحة */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className={`text-3xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'لوحة تحكم المتجر' : 'Store Dashboard'}
            </h1>
            <p className={`text-gray-600 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'إدارة جميع جوانب متجرك من مكان واحد' : 'Manage all aspects of your store from one place'}
            </p>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className={`flex space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {isRTL ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* رأس البطاقة */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {TABS.find(tab => tab.id === activeTab)?.[isRTL ? 'labelAr' : 'labelEn']}
            </h2>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard; 