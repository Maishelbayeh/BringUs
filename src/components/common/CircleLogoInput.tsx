
import useLanguage from '@/hooks/useLanguage';
import React from 'react';

interface CircleLogoInputProps {
  preview: string | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  alt?: string;
  helpText?: string;
  file?: File | null;
  label?: string;
  isEditMode?: boolean;
  t?: (key: string) => string;
  currentLogoUrl?: string | null;
  isRTL?: boolean;
}

const CircleLogoInput: React.FC<CircleLogoInputProps> = ({
  preview,
  onChange,
  onRemove,
  alt = 'Logo',
  helpText,
  file,
  label,
  isEditMode,
  t = (s) => s,
  currentLogoUrl,
 
}) => {

    const { isRTL } = useLanguage();    
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-3 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <div className={`flex items-center gap-6 `}>
        {/* عرض اللوجو الحالي أو المعاينة */}
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary transition-all duration-200"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.png,.jpg,.jpeg';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  onChange(file);
                }
              };
              input.click();
            }}
          >
            {(preview || currentLogoUrl) ? (
              <img
                src={preview || currentLogoUrl || ''}
                alt={alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
            {/* طبقة التحميل عند التمرير */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          {/* زر حذف اللوجو */}
          {(preview || currentLogoUrl) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              title={t('store.removeLogo')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {/* معلومات اللوجو */}
        <div className="flex-1">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {(preview || currentLogoUrl) ? (
                isEditMode ? t('store.currentLogo') : t('store.logoPreview')
              ) : (
                t('store.noLogoSelected')
              )}
            </p>
            {/* زر اختيار الملف (اختياري، لأن الدائرة نفسها تفتح التحميل) */}
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.png,.jpg,.jpeg';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    onChange(file);
                  }
                };
                input.click();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {t('store.selectLogo')}
            </button>
            {/* معلومات الملف */}
            {file && (
              <div className="text-xs text-gray-500">
                <p>{t('store.selectedFile')}: {file.name}</p>
                <p>{t('store.fileSize')}: {(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* نص المساعدة */}
      {helpText && (
        <p className="text-xs text-gray-500 mt-2">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default CircleLogoInput; 