import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface StoreSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  isRTL?: boolean;
}

const StoreSlider: React.FC<StoreSliderProps> = ({
  images,
  autoPlay = true,
  interval = 3000,
  showArrows = true,
  showDots = true,
  className = '',
  isRTL = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);



  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">
          {isRTL ? 'لا توجد صور متاحة' : 'No images available'}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-96 overflow-hidden rounded-lg ${className}`}>
             {/* Images Container */}
       <div 
         className="flex transition-transform duration-500 ease-in-out h-full"
         style={{ 
           transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
           width: `${images.length * 100}%`
         }}
       >
         {images.map((image, index) => (
           <div 
             key={`${image}-${index}`}
             className="w-full h-full flex-shrink-0"
             style={{ width: `${100 / images.length}%` }}
           >
             <img
               src={image}
               alt={`Slide ${index + 1}`}
               className="w-full h-full object-cover"
               onError={(e) => {
                 console.error('❌ Failed to load image:', image);
                 e.currentTarget.style.display = 'none';
               }}
               
             />
           </div>
         ))}
       </div>

             {/* Navigation Arrows */}
       {showArrows && images.length > 1 && (
         <>
           <button
             onClick={isRTL ? goToNext : goToPrevious}
             className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-10"
             aria-label={isRTL ? 'التالي' : 'Previous'}
           >
             <ChevronLeftIcon className="w-5 h-5" />
           </button>
           <button
             onClick={isRTL ? goToPrevious : goToNext}
             className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-10"
             aria-label={isRTL ? 'السابق' : 'Next'}
           >
             <ChevronRightIcon className="w-5 h-5" />
           </button>
         </>
       )}

               {/* Dots Indicator */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

      

             {/* Slide Counter */}
       {images.length > 1 && (
         <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
           {currentIndex + 1} / {images.length}
         </div>
       )}

       
    </div>
  );
};

export default StoreSlider; 