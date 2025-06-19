import React from 'react';

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
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  color = '#1976d2',
  text,
  textColor = '#fff',
  alignment = 'center',
  action,
  icon,
  className = '',
  bordercolor = 'primary',
  style = {},
  type = 'button',
  ...props
}) => {
  let justifyContent: React.CSSProperties['justifyContent'] = 'center';
  if (alignment === 'left') justifyContent = 'flex-start';
  if (alignment === 'right') justifyContent = 'flex-end';

  return (
    <button
      type={type}
      onClick={action}
      className={`flex items-center  font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none transition-all duration-200 text-${textColor} bg-${color} shadow-sm ${className} border border-${bordercolor} hover:bg-${color}-light hover:text-${textColor}`}
      style={{
      
        justifyContent,
        ...style,
      }}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default CustomButton;