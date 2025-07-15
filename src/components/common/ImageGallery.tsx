import React, { useState } from 'react';
import ProductImage from './ProductImage';

interface ImageGalleryProps {
  images: string[];
  mainImage?: string | null;
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [],
  mainImage,
  alt = 'Product Images',
  className = '',
  showThumbnails = true
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(mainImage || images[0] || '');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const allImages = mainImage ? [mainImage, ...images] : images;
  const currentImage = selectedImage || allImages[0];

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setSelectedImage(allImages[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  if (allImages.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <ProductImage
          src={null}
          alt={alt}
          className="w-full h-64 object-cover"
          width={400}
          height={256}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* الصورة الرئيسية */}
      <div className="relative group">
        <ProductImage
          src={currentImage}
          alt={alt}
          className="w-full h-64 object-cover rounded-lg"
          width={400}
          height={256}
        />
        
        {/* أزرار التنقل */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* الصور المصغرة */}
      {showThumbnails && allImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(image, index)}
              className={`flex-shrink-0 ${
                currentIndex === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <ProductImage
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-16 h-16 object-cover rounded-md"
                width={64}
                height={64}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 