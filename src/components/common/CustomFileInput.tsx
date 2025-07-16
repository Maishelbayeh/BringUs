import React, { useRef, useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomFileInputProps {
  label: string;
  value?: string | string[];
  onChange: (files: File | File[] | null) => void;
  error?: string;
  placeholder?: string;
  id?: string;
  style?: React.CSSProperties;
  multiple?: boolean;
  isRTL?: boolean;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({ 
  label, 
  value, 
  onChange, 
  error, 
  placeholder, 
  id, 
  style, 
  multiple = false,
  isRTL = false
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // تحميل الصور الموجودة مسبقاً
  useEffect(() => {
    console.log('🔍 CustomFileInput - value:', value);
    if (value) {
      const imageUrls = Array.isArray(value) ? value : [value];
      const validUrls = imageUrls.filter(url => url && typeof url === 'string');
      
      if (validUrls.length > 0) {
        setPreviews(validUrls);
        setFileCount(validUrls.length);
        setFileNames(validUrls.map(url => url.split('/').pop() || 'image'));
      }
    }
  }, [value]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const newFiles = Array.from(files);
    const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : newFiles;
    setSelectedFiles(updatedFiles);
    setFileCount(updatedFiles.length);
    setFileNames(updatedFiles.map(file => file.name));
    onChange(multiple ? updatedFiles : updatedFiles[0]);

    // Generate previews for new files
    const newPreviews: string[] = [...previews];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleClick = () => {
    if (fileRef.current) {
      fileRef.current.value = ''; // Reset input value to allow selecting the same file again
      fileRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFileNames = fileNames.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setFileNames(newFileNames);
    setFileCount(newFiles.length);
    onChange(multiple ? newFiles : null);
  };

  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${currentLanguage === 'ARABIC' ? 'text-right' : 'text-left'}`} style={style}>
        {label}
      </label>
      <div
        className={`flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed  text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full p-2.5 cursor-pointer transition-all duration-200 hover:bg-primary/10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500' : ''}`}
        onClick={handleClick}
      >
        <input
          ref={fileRef}
          id={id}
          type="file"
          accept=".png,.jpg,.jpeg"
          multiple={multiple}
          hidden
          onChange={handleFileChange}
        />
        {previews.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img 
                  src={preview} 
                  alt={`preview ${index + 1}`} 
                  className="rounded-lg object-cover" 
                  style={{ width: 80, height: 80 }} 
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-12 w-12 text-primary text-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4m4 0a1 1 0 01-1 1h-2a1 1 0 01-1-1m4 0V4m0 16v-4m0 4h4m-4 0H7" />
          </svg>
        )}
        <span className="text-xs text-gray-400 mt-1 text-center w-full">PNG, JPG, JPEG</span>
        {fileNames.length > 0 && (
          <div className={`flex flex-col items-${isRTL ? 'end' : 'start'} w-full mt-2 gap-1`}>
            {fileNames.map((name, index) => (
              <span key={index} className="text-sm text-gray-600">
                {name}
              </span>
            ))}
          </div>
        )}
        <span className={`block text-gray-500 dark:text-gray-400 font-medium text-center w-full mt-2`}>
          {fileCount > 0 ? `${fileCount} ${isRTL ? 'ملف محدد' : 'files selected'}` : placeholder}
        </span>
      </div>
      <Typography variant="caption" color="text.secondary" style={style}>
        {t('paymentMethods.qrPictureDescription2')}
      </Typography>
      {error && <span className={`mt-1 text-xs text-red-600 block ${currentLanguage === 'ARABIC' ? 'text-right' : 'text-left'}`} style={style}>{error}</span>}
    </div>
  );
};

export default CustomFileInput; 