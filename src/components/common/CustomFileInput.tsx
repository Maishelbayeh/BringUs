import React, { useRef } from 'react';
import { CloudUploadIcon } from '@heroicons/react/outline';

interface CustomFileInputProps {
  label: string;
  value?: string;
  onChange: (file: File | null) => void;
  error?: string;
  placeholder?: string;
  id?: string;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({ label, value, onChange, error, placeholder, id }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    onChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">
        {label}
      </label>
      <div
        className={`flex flex-col items-start justify-center bg-gray-50 border-2 border-dashed border-primary text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary w-full p-6 cursor-pointer transition-all duration-200 hover:bg-primary/10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500' : ''}`}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          id={id}
          type="file"
          accept=".png,.jpg,.jpeg"
          hidden
          onChange={e => handleFileChange(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />
        {preview ? (
          <img src={preview} alt="preview" className="mb-2 rounded-lg object-cover" style={{ width: 80, height: 80 }} />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4m4 0a1 1 0 01-1 1h-2a1 1 0 01-1-1m4 0V4m0 16v-4m0 4h4m-4 0H7" />
          </svg>
        )}
        <span className="block text-gray-500 dark:text-gray-400 font-medium text-left w-full">
          {value || placeholder}
        </span>
        <span className="text-xs text-gray-400 mt-1 text-left w-full">PNG, JPG, JPEG</span>
      </div>
      {error && <span className="mt-1 text-xs text-red-600 block text-left">{error}</span>}
    </div>
  );
};

export default CustomFileInput; 