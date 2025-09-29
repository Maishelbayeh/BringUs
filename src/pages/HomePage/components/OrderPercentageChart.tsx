import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ResponsivePie } from '@nivo/pie';
import { 
  ChartPieIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import useLanguage from '../../../hooks/useLanguage';
import useOrderPercentage from '../../../hooks/useOrderPercentage';

interface OrderPercentageChartProps {
  isLoading?: boolean;
}

const OrderPercentageChart: React.FC<OrderPercentageChartProps> = ({ isLoading = false }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { orderPercentage, loading, error, refreshOrderPercentage } = useOrderPercentage();

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

  // تحضير البيانات للتشارت
  const chartData = orderPercentage ? [
    {
      id: t('dashboard.guestUsers'),
      label: t('dashboard.guestUsers'),
      value: orderPercentage.percentages.guest,
      count: orderPercentage.guestOrders,
      color: '#3B82F6' // أزرق
    },
    {
      id: t('dashboard.loggedUsers'),
      label: t('dashboard.loggedUsers'),
      value: orderPercentage.percentages.loggedUsers,
      count: orderPercentage.loggedUserOrders,
      color: '#10B981' // أخضر
    }
  ] : [];

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-lg p-6"
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartPieIcon className="h-5 w-5 mx-2 text-purple-500" />
            {t('dashboard.orderPercentage')}
          </h3>
          <button
            onClick={refreshOrderPercentage}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {t('dashboard.refresh')}
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshOrderPercentage}
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
      className="bg-white rounded-xl shadow-lg p-6"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartPieIcon className="h-5 w-5 mx-2 text-purple-500" />
          {t('dashboard.orderPercentage')}
        </h3>
        <button
          onClick={refreshOrderPercentage}
          disabled={loading || isLoading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
        >
          
          <span>{t('dashboard.refresh')}</span>
        </button>
      </motion.div>

      {/* Loading State */}
      {loading || isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !orderPercentage ? (
        <div className="text-center py-8">
          <ChartPieIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('dashboard.noOrderData')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart */}
          <motion.div variants={itemVariants} className="h-64">
            <ResponsivePie
              data={chartData}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            //   enableArcLabels={false}
              enableArcLinkLabels={false}
              colors={{ datum: 'data.color' }}
              tooltip={({ datum }) => (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                  <div className="flex items-center space-x-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: datum.color }}
                    />
                    <span className="font-medium">{datum.label}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('dashboard.percentage')}: {datum.value.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('dashboard.orders')}: {datum.data.count}
                  </div>
                </div>
              )}
              theme={{
                tooltip: {
                  container: {
                    background: 'white',
                    color: '#333',
                    fontSize: 12,
                    borderRadius: '6px',
                    boxShadow: '0 3px 9px rgba(0, 0, 0, 0.15)',
                  },
                },
              }}
            />
          </motion.div>

          {/* Legend and Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chartData.map((item) => (
              <div 
              key={item.id} 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2"
            >
              {/* Left side */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.count} {t('dashboard.orders')}
                  </div>
                </div>
              </div>
            
              {/* Right side */}
              <div className="text-right">
                <div className="text-base sm:text-lg font-semibold text-gray-900">
                  {item.value.toFixed(1)}%
                </div>
              </div>
            </div>
            
            ))}
          </motion.div>

          {/* Total Orders */}
          <motion.div variants={itemVariants} className="text-center pt-4 border-t">
            <div className="text-sm text-gray-500 mb-1">{t('dashboard.totalOrders')}</div>
            <div className="text-2xl font-bold text-gray-900">
              {orderPercentage.totalOrders.toLocaleString()}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderPercentageChart;
