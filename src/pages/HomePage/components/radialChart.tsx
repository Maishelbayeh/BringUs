// src/components/NestedRadialChart.tsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from 'react-i18next';

// Top 6 products by sales
const salesData = [
  { name: "Smartphones", value: 500 },
  { name: "Laptops", value: 450 },
  { name: "Headphones", value: 300 },
  { name: "Watches", value: 250 },
  { name: "Shoes", value: 200 },
  { name: "Bags", value: 150 },
];

// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF66C4"];

const NestedRadialChart: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-2 sm:p-3 md:p-4 h-full">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">{t('chart.salesDistributionByCategory')}</h2>
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              formatter={(value, name) => [`${value}`, `${name}`]}
              contentStyle={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                paddingTop: '10px'
              }}
            />
            <Pie
              data={salesData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="60%"
              fill="#8884d8"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ 
                      fontSize: 'clamp(10px, 1.5vw, 12px)', 
                      fontWeight: 'bold' 
                    }}
                  >
                    {salesData[index].value}
                  </text>
                );
              }}
              labelLine={false}
            >
              {salesData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NestedRadialChart;
