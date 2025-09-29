import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import useDashboardStats from '../../hooks/useDashboardStats';
import DashboardStatCard from './components/DashboardStatCard';
import RevenueChart from './components/RevenueChart';
import TopUsersAnalytics from './components/TopUsersAnalytics';
import TopProductsAnalytics from './components/TopProductsAnalytics';
import OrderPercentageChart from './components/OrderPercentageChart';
import { isStoreActive } from '../../constants/sideBarData';
import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { WarningAmber } from '@mui/icons-material';

const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { stats, loading, error, refreshStats } = useDashboardStats();
  const storeActive = isStoreActive();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Show subscription expired message if store is inactive
  if (!storeActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[45%] text-center "
        >
          <div className="text-red-500 text-6xl mb-4">
            <CreditCardIcon className="h-16 w-16 mx-auto text-red-500" />
          </div>
          
          <p className="text-gray-600 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {t('general.subscriptionExpired')}
          </p>
          <button
            onClick={() => {
              // This will be handled by the navbar renewal button
              const renewalButton = document.querySelector('[data-renewal-button]');
              if (renewalButton) {
                (renewalButton as HTMLElement).click();
              }
            }}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            {t('general.renewSubscription')}
          </button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md"
        >
          <div className="text-red-500 text-6xl mb-4"><WarningAmber className='text-red-500' /></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('dashboard.errorLoadingData')}
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={refreshStats}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {t('dashboard.retry')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=" mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('dashboard.welcomeTitle')}
            </h1>
            <p className="text-gray-600">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>
        </motion.div>

     
     
        {/* Total Revenue Section */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
          style={{
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {t('dashboard.totalRevenue')}
                </h2>
                <p className="text-green-100 mb-4">
                  {t('dashboard.totalRevenueSubtitle')}
                </p>
                <div className="text-4xl font-bold">
                  {stats?.totalRevenue?.toLocaleString() || '0'} {stats?.storeCurrency || 'ILS'}
                </div>
              </div>
              <div className="text-right">
                <CurrencyDollarIcon className="h-16 w-16 text-green-200" />
                <div className="mt-2 text-sm text-green-100">
                  {t('dashboard.allTimeRevenue')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardStatCard
           link={`/orders`}
            title={t('dashboard.totalOrders')}
            value={stats?.totalOrders || 0}
            icon={ShoppingCartIcon}
            color="#3B82F6"
            bgColor="#EBF4FF"
            trend={{ value: 12.5, isPositive: true }}
            isLoading={loading}
          />
          
          <DashboardStatCard
          link={`/customers`}
            title={t('dashboard.totalCustomers')}
            value={stats?.totalCustomers || 0}
            icon={UsersIcon}
            color="#6366F1"
            bgColor="#EEF2FF"
            trend={{ value: 8.2, isPositive: true }}
            isLoading={loading}
          />
          
          <DashboardStatCard
          link={`/products`}
            title={t('dashboard.totalProducts')}
            value={stats?.totalProducts || 0}
            icon={CubeIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            trend={{ value: 15.3, isPositive: true }}
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.monthlyRevenue')}
            value={stats?.monthlyRevenue || 0}
            prefix={stats?.storeCurrency || 'ILS'}
            icon={CurrencyDollarIcon}
            color="#8B5CF6"
            bgColor="#F3F4F6"
            trend={{ value: 5.2, isPositive: true }}
            isLoading={loading}
          />
        </motion.div>

        {/* Order Status Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <DashboardStatCard
            link={`/orders`}
            title={t('dashboard.pendingOrders')}
            value={stats?.pendingOrders || 0}
            icon={ClockIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            isLoading={loading}
          />
          
          <DashboardStatCard
            link={`/orders`}
            title={t('dashboard.shippedOrders')}
            value={stats?.shippedOrders || 0}
            icon={TruckIcon}
            color="#6366F1"
            bgColor="#EEF2FF"
            isLoading={loading}
          />
          
          <DashboardStatCard
            link={`/orders`}
            title={t('dashboard.completedOrders')}
            value={stats?.completedOrders || 0}
            icon={CheckCircleIcon}
            color="#10B981"
            bgColor="#ECFDF5"
            isLoading={loading}
          />
          
          <DashboardStatCard
            link={`/orders`}
            title={t('dashboard.cancelledOrders')}
            value={stats?.cancelledOrders || 0}
            icon={XCircleIcon}
            color="#EF4444"
            bgColor="#FEF2F2"
            isLoading={loading}
          />
          
          <DashboardStatCard
            link={`/stock-preview`}
            title={t('dashboard.lowStockItems')}
            value={stats?.productStats?.lowStock || 0}
            icon={ExclamationTriangleIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            isLoading={loading}
          />
        </motion.div>

        {/* Charts and Lists Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <RevenueChart 
              data={stats?.revenueChart || []} 
              isLoading={loading} 
            />
          </motion.div>

          {/* Top Users Analytics */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <TopUsersAnalytics isLoading={loading} />
          </motion.div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Order Percentage Chart */}
          <motion.div variants={itemVariants}>
            <OrderPercentageChart isLoading={loading} />
          </motion.div>

          {/* Top Products Analytics */}
          <motion.div variants={itemVariants}>
            <TopProductsAnalytics isLoading={loading} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Homepage;
