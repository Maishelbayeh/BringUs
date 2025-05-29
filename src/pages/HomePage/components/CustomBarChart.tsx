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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-center">{t('chart.salesByProductType')}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 10, left: 0 }}
          className="bg-white rounded-lg overflow-hidden"
        >
          <XAxis
            dataKey="productType"            // عرض اسم النوع بدل الـ name
            axisLine={true}                  // إظهار خط المحور
            tickLine={false}                 // إزالة الخطوط الصغيرة عند كل تكت
            tick={{ dy: 10, fontSize: 12 }}  // مسافة عمودية للكتابة
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="uv" fill="#8884d8" label={{ position: 'top', dy: -6 }} isAnimationActive={true} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
