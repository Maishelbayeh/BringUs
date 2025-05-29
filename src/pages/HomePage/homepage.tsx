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
    <main className={`p-6 overflow-auto h-full ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        <StatCard title={t('statCard.totalOrders')} value={3024} trend={12.5} icon={ShoppingCart} color="blue" />
        <StatCard title={t('statCard.revenue')} value={24890} trend={-2.4} icon={Assessment} color="green" />
        <StatCard title={t('statCard.activeCustomers')} value={1253} trend={8.2} icon={People} color="purple" />
        <StatCard title={t('statCard.conversionRate')} value={2.4} trend={1.2} icon={TrendingUp} color="orange" />
      </div>

      <div className={`flex flex-col lg:flex-row gap-10 mt-10 flex-grow ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`}>
        <div className="w-full lg:w-2/3 bg-white p-4 shadow-md rounded-lg flex-grow">
          <CustomBarChart />
        </div>
        <div className="w-full lg:w-1/3 bg-white p-4 shadow-md rounded-lg flex-grow">
          <NestedRadialChart />
        </div>
      </div>
    </main>
  );
};

export default Homepage;
