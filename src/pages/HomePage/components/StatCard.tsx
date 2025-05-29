import React from 'react';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import useLanguage from '../../../hooks/useLanguage';

interface StatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  color,
}) => {
  const isPositive = trend > 0;
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}
    >
      <div className="p-4 bg-white rounded-lg shadow-md flex flex-col justify-between h-40">
        {/* Header */}
        <div className={`flex justify-between items-center ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
          {language === 'ARABIC' ? (
            <>
              <Icon style={{ color, fontSize: 20 }} />
              <h2 className="text-sm font-medium text-blue-600">{title}</h2>
            </>
          ) : (
            <>
              <h2 className="text-sm font-medium text-blue-600">{title}</h2>
              <Icon style={{ color, fontSize: 20 }} />
            </>
          )}
        </div>

        {/* Main Value */}
        <div className="text-left">
          <h3 className="text-2xl font-bold">
            <CountUp end={value} separator="," duration={2} />
          </h3>
        </div>

        {/* Footer (trend) */}
        <div className={`flex items-center ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
          {isPositive ? (
            <TrendingUp className="text-green-500 mr-1" style={{ fontSize: 18 }} />
          ) : (
            <TrendingDown className="text-red-500 mr-1" style={{ fontSize: 18 }} />
          )}
          <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}% vs last month
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 