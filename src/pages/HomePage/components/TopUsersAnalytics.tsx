import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  TrophyIcon, 
} from '@heroicons/react/24/outline';
import useLanguage from '../../../hooks/useLanguage';
import useTopUsers from '../../../hooks/useTopUsers';
import { getCurrencySymbol } from '../../../data/currencyOptions';

interface TopUsersAnalyticsProps {
  isLoading?: boolean;
}

const TopUsersAnalytics: React.FC<TopUsersAnalyticsProps> = ({ isLoading = false }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { topUsers, loading, error, refreshTopUsers } = useTopUsers();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isRTL ? 20 : -20 },
    visible: { opacity: 1, x: 0 }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <TrophyIcon className="h-6 w-6 text-gray-400" />;
      case 2:
        return <TrophyIcon className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    // الحصول على عملة المتجر من localStorage
    const storeInfo = localStorage.getItem('storeInfo');
    const storeCurrency = storeInfo ? JSON.parse(storeInfo).settings?.currency : 'ILS';
    
    // الحصول على رمز العملة المناسب للغة
    const currencySymbol = getCurrencySymbol(storeCurrency || 'ILS', isRTL);
    
    // تنسيق المبلغ مع رمز العملة
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    // عرض رمز العملة حسب اتجاه اللغة
    return isRTL ? `${formattedAmount} ${currencySymbol}` : `${currencySymbol} ${formattedAmount}`;
  };

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-lg p-6 h-full"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrophyIcon className="h-5 w-5 mx-2 text-yellow-500" />
            {t('dashboard.topUsers')}
          </h3>
          <button
            onClick={refreshTopUsers}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {t('dashboard.refresh')}
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshTopUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.retry')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-lg p-6 h-full"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrophyIcon className="h-5 w-5 m-2 text-yellow-500" />
          {t('dashboard.topUsers')}
        </h3>
        <button
          onClick={refreshTopUsers}
          disabled={loading || isLoading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
        >
          {t('dashboard.refresh')}
        </button>
      </motion.div>

      {/* Loading State */}
      {loading || isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              {/* Mobile Loading */}
              <div className="sm:hidden p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              </div>
              
              {/* Desktop Loading */}
              <div className="hidden sm:flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-6">
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  <div className="w-20 h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : topUsers.length === 0 ? (
        <div className="text-center py-8">
          <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('dashboard.noTopUsers')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <motion.div
              key={user.userId}
              variants={itemVariants}
              className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
              }`}
            >
              {/* Mobile Layout */}
              <div className="flex flex-col space-y-3 sm:hidden">
                {/* User Info - Mobile */}
                <div className="flex items-center ">
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                     
                      <h4 className="font-medium text-gray-900 truncate ml-2">
                        {user.firstName} {user.lastName}
                      </h4>
                    </div>
                    
                    <div className=" text-sm text-gray-500">
                      <span className="truncate block">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats - Mobile */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.productsSold')}</div>
                    <div className="font-medium text-gray-900">{user.totalProductsSold}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.orders')}</div>
                    <div className="font-medium text-gray-900">{user.orderCount}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.revenue')}</div>
                    <div className="font-medium text-green-600">{formatCurrency(user.totalRevenue)}</div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                {/* User Info - Desktop */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                     
                      <h4 className="font-medium text-gray-900 truncate ml-2">
                        {user.firstName} {user.lastName}
                      </h4>
                    </div>
                    
                    <div className=" text-sm text-gray-500">
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats - Desktop */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.productsSold')}</div>
                    <div className="font-medium text-gray-900">{user.totalProductsSold}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.orders')}</div>
                    <div className="font-medium text-gray-900">{user.orderCount}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{t('dashboard.revenue')}</div>
                    <div className="font-medium text-green-600">{formatCurrency(user.totalRevenue)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TopUsersAnalytics;
