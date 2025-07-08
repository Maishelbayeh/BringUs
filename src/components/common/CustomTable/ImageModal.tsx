import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageModalState } from './types';

interface ImageModalProps {
  modal: ImageModalState;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ modal, onClose }) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    if (modal.src) {
      const link = document.createElement('a');
      link.href = modal.src;
      link.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!modal.isOpen) return null;

  return (
    <div 
      className="image-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="image-modal-content relative max-w-4xl max-h-[90vh] p-4 bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('common.imagePreview')}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm"
              title={t('common.download')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              title={t('common.close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg">
          <img 
            src={modal.src} 
            alt={modal.alt || t('common.unknown')} 
            className="max-w-full max-h-[70vh] object-contain w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png'; // صورة بديلة
              target.alt = t('common.imageError');
            }}
          />
          
          {/* Loading overlay */}
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center opacity-0 transition-opacity duration-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>

        {/* Image info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>{t('common.imageName')}: {modal.alt || t('common.unknown')}</p>
          <p>{t('common.clickOutsideToClose')}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
export { ImageModal }; 