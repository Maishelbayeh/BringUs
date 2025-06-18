import React from 'react';
import AffiliationForm from './AffiliationForm';
import CustomButton from '../../../components/common/CustomButton';

interface AffiliationDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  form?: any;
  onFormChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

const AffiliationDrawer: React.FC<AffiliationDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onSubmit }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-2xl bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300`}
        style={{ [isRTL ? 'left' : 'right']: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          {form && onFormChange && <AffiliationForm form={form} onFormChange={onFormChange} isRTL={isRTL} />}
        </form>
        <div className="sticky bottom-0 left-0 right-0 bg-white py-4 flex justify-end gap-2 border-t mt-4">
          <CustomButton text="Cancel" color="secondary" onClick={onClose} />
          <CustomButton text="Save" color="primary" textColor="white" type="submit" onClick={onSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AffiliationDrawer;
