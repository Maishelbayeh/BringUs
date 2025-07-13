import React, { createContext, useContext, ReactNode } from 'react';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';

interface ToastContextType {
  toasts: any[];
  showSuccess: (message: string, title?: string, duration?: number) => string;
  showError: (message: string, title?: string, duration?: number) => string;
  showWarning: (message: string, title?: string, duration?: number) => string;
  showInfo: (message: string, title?: string, duration?: number) => string;
  addToast: (options: any) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();
  
  console.log('ToastProvider rendered with toast functions:', {
    showSuccess: typeof toast.showSuccess,
    showError: typeof toast.showError,
    toastsCount: toast.toasts.length
  });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  // console.log('useToastContext called, context:', context);
  
  if (context === undefined) {
    console.error('useToastContext must be used within a ToastProvider');
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}; 