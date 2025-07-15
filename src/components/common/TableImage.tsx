import React from 'react';
import ProductImage from './ProductImage';

interface TableImageProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TableImage: React.FC<TableImageProps> = ({
  src,
  alt = 'Image',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex-shrink-0 ${className}`}>
      <ProductImage
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-md object-cover`}
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
      />
    </div>
  );
};

export default TableImage; 