import React from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface CustomBreadcrumbProps {
  items: BreadcrumbItem[];
  isRtl?: boolean;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ items, isRtl }) => {
  const dir = isRtl ? 'rtl' : 'ltr';

  const ChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <nav className={`flex mb-4 text-sm text-gray-500 flex-row`} dir={dir} aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={item.href || item.name} className="flex items-center">
          {idx > 0 && <ChevronIcon className="w-4 h-4 mx-1 text-gray-400" />}
          {item.href && idx !== items.length - 1 ? (
            <a href={item.href} className="hover:underline text-primary">{item.name}</a>
          ) : (
            <span className="font-bold text-primary">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default CustomBreadcrumb; 