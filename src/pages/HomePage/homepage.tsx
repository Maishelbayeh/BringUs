// src/pages/Homepage.tsx
import React from 'react';
import StatCard from './components/StatCard';
import NestedRadialChart from './components/radialChart';
import CustomBarChart from './components/CustomBarChart';
import { ShoppingCart, Assessment, People, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';

const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <main className={`p-2 sm:p-4 md:p-6 overflow-auto h-full ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
      {/* Stat Cards - Responsive Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        <StatCard title={t('statCard.totalOrders')} value={3024} trend={12.5} icon={ShoppingCart} color="blue" />
        <StatCard title={t('statCard.revenue')} value={24890} trend={-2.4} icon={Assessment} color="green" />
        <StatCard title={t('statCard.activeCustomers')} value={1253} trend={8.2} icon={People} color="purple" />
        <StatCard title={t('statCard.conversionRate')} value={2.4} trend={1.2} icon={TrendingUp} color="orange" />
      </div>

      {/* Charts Section - Responsive Layout */}
      <div className={`flex flex-col xl:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-6 sm:mt-8 md:mt-10 flex-grow ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        {/* Bar Chart - Responsive Width */}
        <div className="w-full xl:w-2/3 bg-white p-2 sm:p-3 md:p-4 shadow-md rounded-lg flex-grow">
          <CustomBarChart />
        </div>
        {/* Radial Chart - Responsive Width */}
        <div className="w-full xl:w-1/3 bg-white p-2 sm:p-3 md:p-4 shadow-md rounded-lg flex-grow">
          <NestedRadialChart />
        </div>
      </div>
    </main>
  );
};

export default Homepage;
