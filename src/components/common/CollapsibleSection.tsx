import React from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRTL?: boolean;
}

/**
 * مكون القسم القابل للطي
 * يمكن استخدامه في أي مكان لعرض محتوى قابل للطي
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isCollapsed,
  onToggle,
  children,
  isRTL = false
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span 
          className={`transform transition-transform duration-200 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>
      
      {!isCollapsed && (
        <div className="px-6 py-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection; 