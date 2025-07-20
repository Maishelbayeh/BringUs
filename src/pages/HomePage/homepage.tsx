// src/pages/Homepage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import useDashboardStats from '../../hooks/useDashboardStats';
import DashboardStatCard from './components/DashboardStatCard';
import RevenueChart from './components/RevenueChart';
import RecentOrders from './components/RecentOrders';
import TopCategories from './components/TopCategories';
import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { stats, loading, error, refreshStats } = useDashboardStats();

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
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
        className="max-w-7xl mx-auto"
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

        {/* Stats Cards Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardStatCard
            title={t('dashboard.totalOrders')}
            value={stats?.totalOrders || 0}
            icon={ShoppingCartIcon}
            color="#3B82F6"
            bgColor="#EBF4FF"
            trend={{ value: 12.5, isPositive: true }}
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.totalRevenue')}
            value={stats?.totalRevenue || 0}
            prefix="$"
            icon={CurrencyDollarIcon}
            color="#10B981"
            bgColor="#ECFDF5"
            trend={{ value: -2.4, isPositive: false }}
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.totalCustomers')}
            value={stats?.totalCustomers || 0}
            icon={UsersIcon}
            color="#8B5CF6"
            bgColor="#F3F4F6"
            trend={{ value: 8.2, isPositive: true }}
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.totalProducts')}
            value={stats?.totalProducts || 0}
            icon={CubeIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            trend={{ value: 15.3, isPositive: true }}
            isLoading={loading}
          />
        </motion.div>

        {/* Order Status Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardStatCard
            title={t('dashboard.pendingOrders')}
            value={stats?.pendingOrders || 0}
            icon={ClockIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.completedOrders')}
            value={stats?.completedOrders || 0}
            icon={CheckCircleIcon}
            color="#10B981"
            bgColor="#ECFDF5"
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.cancelledOrders')}
            value={stats?.cancelledOrders || 0}
            icon={XCircleIcon}
            color="#EF4444"
            bgColor="#FEF2F2"
            isLoading={loading}
          />
          
          <DashboardStatCard
            title={t('dashboard.lowStockItems')}
            value={stats?.productStats?.lowStock || 0}
            icon={ExclamationTriangleIcon}
            color="#F59E0B"
            bgColor="#FFFBEB"
            isLoading={loading}
          />
        </motion.div>

        {/* Charts and Lists Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <RevenueChart 
              data={stats?.revenueChart || []} 
              isLoading={loading} 
            />
          </motion.div>

          {/* Recent Orders */}
          <motion.div variants={itemVariants}>
            <RecentOrders 
              orders={stats?.recentOrders || []} 
              isLoading={loading} 
            />
          </motion.div>
        </div>

        {/* Top Categories */}
        <motion.div variants={itemVariants} className="mt-8">
          <TopCategories 
            categories={stats?.topCategories || []} 
            isLoading={loading} 
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Homepage;
