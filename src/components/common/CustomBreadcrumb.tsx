import React from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const ChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <nav className={`flex mb-4 text-sm text-gray-500 flex-row`} dir={dir} aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={item.href || item.name} className="flex items-center">
          {idx > 0 && <ChevronIcon className="w-4 h-4 mx-1 text-gray-400" />}
          {item.href && idx !== items.length - 1 ? (
            <button
              type="button"
              className="hover:underline text-primary bg-transparent border-0 p-0 m-0 cursor-pointer focus:outline-none"
              onClick={() => navigate(item.href!)}
            >
              {item.name}
            </button>
          ) : (
            <span className="font-bold text-primary">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default CustomBreadcrumb; 