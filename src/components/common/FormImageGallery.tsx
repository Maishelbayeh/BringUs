import React from 'react';
import { ImageGallery } from './index';

interface FormImageGalleryProps {
  images: string[];
  mainImage?: string | null;
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
  onImageRemove?: (index: number) => void;
  editable?: boolean;
}

const FormImageGallery: React.FC<FormImageGalleryProps> = ({
  images = [],
  mainImage,
  alt = 'Product Images',
  className = '',
  showThumbnails = true,
  onImageRemove,
  editable = false
}) => {
 

  if (images.length === 0 && !mainImage) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No images uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ImageGallery
        images={images}
        mainImage={mainImage}
        alt={alt}
        showThumbnails={showThumbnails}
      />
      
      {editable && (images.length > 0 || mainImage) && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images:</h4>
          <div className="flex flex-wrap gap-2">
            {mainImage && (
              <div className="relative">
                <img
                  src={mainImage}
                  alt="Main"
                  className="w-16 h-16 object-cover rounded-md"
                />
                {onImageRemove && (
                  <button
                    onClick={() => onImageRemove(-1)} // -1 for main image
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
                <span className="text-xs text-gray-500 block mt-1">Main</span>
              </div>
            )}
            
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
                {onImageRemove && (
                  <button
                    onClick={() => onImageRemove(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
                <span className="text-xs text-gray-500 block mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormImageGallery; 