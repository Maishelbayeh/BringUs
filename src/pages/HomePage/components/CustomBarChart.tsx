// src/components/CustomBarChart.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

const data = [
  { name: 'Page A', uv: 400, productType: 'Electronics' },
  { name: 'Page B', uv: 300, productType: 'Fashion' },
  { name: 'Page C', uv: 200, productType: 'Home' },
  { name: 'Page D', uv: 278, productType: 'Books' },
  { name: 'Page E', uv: 189, productType: 'Toys' },
  { name: 'Page F', uv: 239, productType: 'Sports' },
  { name: 'Page G', uv: 349, productType: 'Beauty' },
];

const CustomBarChart: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-2 sm:p-3 md:p-4 h-full">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">{t('chart.salesByProductType')}</h2>
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ 
              top: 5, 
              right: 10, 
              bottom: 20, 
              left: 10 
            }}
            className="bg-white rounded-lg overflow-hidden"
          >
            <XAxis
              dataKey="productType"
              axisLine={true}
              tickLine={false}
              tick={{ 
                dy: 10, 
                fontSize: 'clamp(10px, 1.5vw, 12px)'
              }}
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}
              width={40}
            />
            <Tooltip 
              contentStyle={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                paddingTop: '10px'
              }}
            />
            <Bar 
              dataKey="uv" 
              fill="#8884d8" 
              label={{ 
                position: 'top', 
                dy: -6,
                fontSize: 'clamp(10px, 1.5vw, 12px)'
              }} 
              isAnimationActive={true} 
              animationDuration={1500}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomBarChart;
