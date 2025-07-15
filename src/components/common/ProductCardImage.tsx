import React from 'react';
import ProductImage from './ProductImage';

interface ProductCardImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  showOverlay?: boolean;
  overlayText?: string;
}

const ProductCardImage: React.FC<ProductCardImageProps> = ({
  src,
  alt = 'Product Image',
  className = '',
  showOverlay = false,
  overlayText = ''
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <ProductImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        width={300}
        height={300}
      />
      
      {showOverlay && overlayText && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="text-white text-sm font-medium">{overlayText}</span>
        </div>
      )}
    </div>
  );
};

export default ProductCardImage; 