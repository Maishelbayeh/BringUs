import React, { useRef, useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ImageValidationOptions } from '../../validation/imageValidation';

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
  disabled?: boolean;
  /**
   * Optional validator invoked BEFORE committing selection.
   * If returns isValid:false, the component will:
   *  - show the selected files with an error
   *  - block further selections until offending files are removed
   *  - NOT call onChange until remaining files become valid
   */
  beforeChangeValidate?: (files: File[]) => { isValid: boolean; errorMessage?: string };
  /**
   * Called when user removes an existing (server-sourced) image from previews
   * identified by its index in the current previews list.
   */
  onRemoveExisting?: (previewUrl: string, index: number) => void;
  /**
   * If true, onChange will receive only newly selected files (append mode).
   * If false, onChange receives the full aggregated selection (replace mode).
   */
  appendOnly?: boolean;
  /** Notify parent when internal validation error changes (for form-level blocking) */
  onValidationErrorChange?: (error?: string) => void;
  /** Max allowed image size in MB (default 3 MB) */
  maxImageSizeMB?: number;
  /** Additional validation options for images */
  imageValidationOptions?: ImageValidationOptions;
  required?: boolean;
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
  isRTL = false,
  disabled = false,
  beforeChangeValidate,
  onRemoveExisting,
  appendOnly = false,
  onValidationErrorChange,
  required = false
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Unified validator for selection and removal
  const validateFiles = (filesToValidate: File[]): { isValid: boolean; errorMessage?: string } => {
    // Only validate if beforeChangeValidate is explicitly provided
    // Otherwise, let the backend handle all validation (with bilingual error messages)
    if (beforeChangeValidate) return beforeChangeValidate(filesToValidate);
    
    // No default validation - backend will handle it
    return { isValid: true };
  };

  // تحميل الصور الموجودة مسبقاً
  useEffect(() => {
    //CONSOLE.log('🔍 CustomFileInput useEffect - value:', value);
    //CONSOLE.log('🔍 CustomFileInput useEffect - value type:', typeof value);
    //CONSOLE.log('🔍 CustomFileInput useEffect - value is array:', Array.isArray(value));
    
    if (value && value !== null && value !== undefined) {
      const imageUrls = Array.isArray(value) ? value : [value];
      const validUrls = imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
      
      //CONSOLE.log('🔍 CustomFileInput useEffect - imageUrls:', imageUrls);
      //CONSOLE.log('🔍 CustomFileInput useEffect - validUrls:', validUrls);
      
      // Only mirror external value if there are no locally selected files
      if (selectedFiles.length === 0) {
        if (validUrls.length > 0) {
          setPreviews(validUrls);
          setFileCount(validUrls.length);
          setFileNames(validUrls.map(url => url.split('/').pop() || 'image'));
        } else {
          setPreviews([]);
          setFileCount(0);
          setFileNames([]);
        }
      }
    } else {
      //CONSOLE.log('🔍 CustomFileInput useEffect - Setting empty state');
      if (selectedFiles.length === 0) {
        setPreviews([]);
        setFileCount(0);
        setFileNames([]);
      }
    }
  }, [value, selectedFiles.length]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isBlocked) {
      return;
    }
    const files = event.target.files;
    console.log('🔍 CustomFileInput handleFileChange - files:', files);
    console.log('🔍 CustomFileInput handleFileChange - files length:', files?.length);
    
    if (!files || files.length === 0) {
      console.log('🔍 CustomFileInput handleFileChange - No files selected');
      return;
    }

    const newFiles = Array.from(files);
    const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : newFiles;
    console.log('🔍 CustomFileInput handleFileChange - updatedFiles:', updatedFiles);
    console.log('🔍 CustomFileInput handleFileChange - multiple:', multiple);
    console.log('🔍 CustomFileInput handleFileChange - calling onChange with:', multiple ? updatedFiles : updatedFiles[0]);
    
    // Pre-validation (custom or built-in)
    const validation = validateFiles(updatedFiles);
      if (!validation.isValid) {
        // Show the offending selection, block further uploads, don't propagate change
        setSelectedFiles(updatedFiles);
        setFileNames(updatedFiles.map(file => file.name));
        setIsBlocked(true);
        setInternalError(validation.errorMessage || 'Invalid files selected');
        onValidationErrorChange && onValidationErrorChange(validation.errorMessage || 'Invalid files selected');

        // Create previews for validation error case
        const createPreviews = async (files: File[]) => {
          const previewPromises = files.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = e => {
                resolve(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            });
          });
          
          const newPreviews = await Promise.all(previewPromises);
          
          if (multiple) {
            setPreviews(prev => {
              const merged = [...prev, ...newPreviews];
              setFileCount(merged.length);
              return merged;
            });
          } else {
            setPreviews(newPreviews);
            setFileCount(newPreviews.length);
          }
        };
        
        createPreviews(newFiles);
        return;
      } else {
        // Clear any internal error/block if previously set
        setIsBlocked(false);
        setInternalError(undefined);
        onValidationErrorChange && onValidationErrorChange(undefined);
      }

    setSelectedFiles(updatedFiles);
    setFileNames(updatedFiles.map(file => file.name));
    // In appendOnly mode send only new files, otherwise send all
    if (appendOnly) {
      onChange(multiple ? newFiles : newFiles[0]);
    } else {
      onChange(multiple ? updatedFiles : updatedFiles[0]);
    }

    // Create previews for successful validation case
    const createPreviews = async (files: File[]) => {
      const previewPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = e => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      const newPreviews = await Promise.all(previewPromises);
      
      if (multiple) {
        setPreviews(prev => {
          const merged = [...prev, ...newPreviews];
          setFileCount(merged.length);
          return merged;
        });
      } else {
        setPreviews(newPreviews);
        setFileCount(newPreviews.length);
      }
    };
    
    createPreviews(newFiles);
  };

  const handleClick = () => {
    //CONSOLE.log('🔍 CustomFileInput handleClick - Opening file dialog');
    if (fileRef.current && !disabled && !isBlocked) {
      fileRef.current.value = ''; // Reset input value to allow selecting the same file again
      fileRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    //CONSOLE.log('🔍 CustomFileInput removeFile - index:', index);
    //CONSOLE.log('🔍 CustomFileInput removeFile - selectedFiles before:', selectedFiles);
    
    const existingCount = Math.max(previews.length - selectedFiles.length, 0);
    const isExisting = index < existingCount;

    if (isExisting) {
      // Remove from previews only and delegate to parent for external list
      setPreviews(prev => {
        const copy = prev.filter((_, i) => i !== index);
        setFileCount(copy.length);
        return copy;
      });
      if (onRemoveExisting) {
        const previewUrl = previews[index];
        onRemoveExisting(previewUrl, index);
      }
      return;
    }

    const localIndex = index - existingCount;
    const remainingLocalFiles = selectedFiles.filter((_, i) => i !== localIndex);
    const remainingFileNames = fileNames.filter((_, i) => i !== localIndex);

    setSelectedFiles(remainingLocalFiles);
    setFileNames(remainingFileNames);
    setPreviews(prev => {
      const copy = prev.filter((_, i) => i !== index);
      setFileCount(copy.length);
      return copy;
    });

    // Re-validate remaining files using unified validator
    const validation = validateFiles(remainingLocalFiles);
    if (validation.isValid) {
      setIsBlocked(false);
      setInternalError(undefined);
      onValidationErrorChange && onValidationErrorChange(undefined);
      onChange(multiple ? remainingLocalFiles : null);
    } else {
      setIsBlocked(true);
      setInternalError(validation.errorMessage || internalError);
      onValidationErrorChange && onValidationErrorChange(validation.errorMessage || internalError);
    }
  };

  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${currentLanguage === 'ARABIC' ? 'text-right' : 'text-left'}`} style={style}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed  text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full p-2.5 ${disabled || isBlocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-primary/10'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${(error || internalError) ? 'border-red-500' : ''}`}
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
      {(error || internalError) && <span className={`mt-1 text-xs text-red-600 block ${currentLanguage === 'ARABIC' ? 'text-right' : 'text-left'}`} style={style}>{error || internalError}</span>}
    </div>
  );
};

export default CustomFileInput; 