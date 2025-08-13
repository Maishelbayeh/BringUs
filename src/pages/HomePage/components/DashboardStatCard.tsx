import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

import useLanguage from '../../../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useStoreUrls } from '../../../hooks/useStoreUrls';

interface DashboardStatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  link?: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  color,
  bgColor,
  trend,
  isLoading = false,
  link
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const navigate = useNavigate();
  const { generateUrl } = useStoreUrls();
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          {trend && <div className="h-3 bg-gray-200 rounded w-20"></div>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => {
        if (link) {
          const storeUrl = generateUrl(link);
          navigate(storeUrl);
        }
      }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group"
     >
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h3 className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
          {title}
        </h3>
        <div 
          className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300`}
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>

      <div className={`mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="text-2xl font-bold text-gray-900">
          {prefix}
          <CountUp 
            end={value} 
            separator="," 
            duration={2} 
            decimals={suffix === '%' ? 1 : 0}
          />
          {suffix}
        </div>
      </div>

      {trend && (
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {Math.abs(trend.value)}%
            </span>
          </div>
          <span className={`text-xs text-gray-500 ml-2 ${isRTL ? 'mr-2 ml-0' : ''}`}>
            {isRTL ? 'من الشهر الماضي' : 'vs last month'}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardStatCard; 