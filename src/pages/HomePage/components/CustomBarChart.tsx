// src/components/CustomBarChart.tsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const data = [
  { name: 'Electronics', sales: 12450, growth: '+12%', color: '#6366f1' },
  { name: 'Fashion', sales: 9870, growth: '+8%', color: '#ec4899' },
  { name: 'Home & Garden', sales: 7560, growth: '+15%', color: '#10b981' },
  { name: 'Books', sales: 6230, growth: '+5%', color: '#f59e0b' },
  { name: 'Sports', sales: 5420, growth: '+18%', color: '#ef4444' },
  { name: 'Beauty', sales: 4890, growth: '+22%', color: '#8b5cf6' },
  { name: 'Toys', sales: 4120, growth: '+9%', color: '#06b6d4' },
];

const CustomBarChart: React.FC = () => {
  const { t } = useTranslation();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-4">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              ${payload[0].value.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 font-medium">
              {data.find(item => item.name === label)?.growth}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {t('chart.salesByProductType') || 'Sales by Category'}
          </h2>
          <p className="text-sm text-gray-500">Monthly revenue performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Revenue</span>
        </div>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ 
              top: 20, 
              right: 30, 
              bottom: 40, 
              left: 20 
            }}
          >
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={index} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
              vertical={false}
            />
            
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12,
                fill: '#64748b',
                fontWeight: 500
              }}
              height={60}
              interval={0}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12,
                fill: '#64748b',
                fontWeight: 500
              }}
              width={60}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="sales" 
              radius={[6, 6, 0, 0]}
              isAnimationActive={true} 
              animationDuration={2000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorGradient${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.slice(0, 4).map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <p className="text-xs font-medium text-gray-600">{item.name}</p>
            <p className="text-sm font-bold text-gray-900">${(item.sales / 1000).toFixed(1)}k</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomBarChart;
