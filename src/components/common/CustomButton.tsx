import React from 'react';
import useLanguage from '@/hooks/useLanguage';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  color?: string; // background color
  text: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  action?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bordercolor?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  color = '#1976d2',
  text,
  textColor = 'white',
  alignment = 'center',
  action,
  icon,
  className = '',
  bordercolor = 'primary',
  style = {},
  type = 'button',
  disabled = false,
  size = 'md',
  loading = false,
  loadingText,
  ...props
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  let justifyContent: React.CSSProperties['justifyContent'] = 'center';
  if (alignment === 'left') justifyContent = 'flex-start';
  if (alignment === 'right') justifyContent = 'flex-end';

  const handleClick = () => {
    if (!disabled && !loading && action && type !== 'submit') {
      action();
    }
  };

  // تحديد النص والأيقونة حسب حالة التحميل
  const displayText = loading ? (loadingText || text) : text;
  const displayIcon = loading ? (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
  ) : icon;

  // تحديد حجم الزر
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-5 py-2.5 text-sm';
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${isRTL ? 'flex-row' :'flex-row-reverse' } flex items-center font-medium rounded-lg ${getSizeClasses()} focus:outline-none transition-all duration-200 ${
        disabled || loading
          ? 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-400' 
          : `text-${textColor} bg-${color} shadow-sm border border-${bordercolor} hover:bg-${color}-light hover:text-${textColor} cursor-pointer hover:shadow-md`
      } ${className}`}
      style={{
        justifyContent,
        ...style,
      }}
      {...props}
    >
      {displayIcon && <span className="flex items-center">{displayIcon}</span>}
      <span>{displayText}</span>
    </button>
  );
};

export default CustomButton;