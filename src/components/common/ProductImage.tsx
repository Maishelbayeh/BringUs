import React, { useState, useEffect } from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Product Image',
  className = '',
  width = 100,
  height = 100,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // تحديث imageSrc عندما يتغير src
  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setHasError(false);
    } else {
      setImageSrc(fallbackSrc);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  // إذا لم تكن هناك صورة، استخدم الصورة الافتراضية مباشرة
  if (!src) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onLoad={handleLoad}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
      style={{ objectFit: 'cover' }}
    />
  );
};

export default ProductImage; 