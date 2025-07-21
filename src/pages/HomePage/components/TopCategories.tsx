import React from 'react';
import { motion } from 'framer-motion';
import { TagIcon } from '@heroicons/react/24/outline';
import useLanguage from '../../../hooks/useLanguage';

interface TopCategory {
  name: string;
  count: number;
  revenue: number;
}

interface TopCategoriesProps {
  categories: TopCategory[];
  isLoading?: boolean;
}

const TopCategories: React.FC<TopCategoriesProps> = ({ categories, isLoading = false }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isRTL ? 'أفضل الفئات' : 'Top Categories'}
        </h3>
        <p className="text-sm text-gray-600">
          {isRTL ? 'الفئات الأكثر مبيعاً وإيرادات' : 'Best performing categories by sales and revenue'}
        </p>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className={`text-center py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="text-gray-400 text-4xl mb-2">🏷️</div>
            <p className="text-gray-500">
              {isRTL ? 'لا توجد بيانات للفئات' : 'No category data available'}
            </p>
          </div>
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.count} {isRTL ? 'منتج' : 'products'}
                  </p>
                </div>
              </div>

              <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                <p className="text-sm font-semibold text-gray-900">
                  ${category.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'إيرادات' : 'revenue'}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {categories.length > 0 && (
        <div className={`mt-6 pt-4 border-t border-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
            {isRTL ? 'عرض جميع الفئات' : 'View all categories'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TopCategories; 