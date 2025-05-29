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
    <div style={{ width: "100%", height: 400 }}>
      <h2 className="text-xl font-bold mb-4 text-center">{t('chart.salesDistributionByCategory')}</h2>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
          <Legend verticalAlign="bottom" height={36} />
          <Pie
            data={salesData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
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
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                >
                  {salesData[index].value}
                </text>
              );
            }}
            labelLine={false}
          >
            {salesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NestedRadialChart;
