import { useState, useCallback } from 'react';
import { Toast, ToastOptions } from '../Types.tsx';

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString();
    const toast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message,
      duration: options.duration || 5000,
      isVisible: true,
    };

    console.log('Adding toast:', toast);
    setToasts(prev => {
      const newToasts = [...prev, toast];
      console.log('Updated toasts array:', newToasts);
      return newToasts;
    });

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    // console.log('Removing toast with id:', id);
    setToasts(prev => {
      const newToasts = prev.filter(toast => toast.id !== id);
      // console.log('Toasts after removal:', newToasts);
      return newToasts;
    });
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    console.log('showSuccess called with:', { message, title, duration });
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    console.log('showError called with:', { message, title, duration });
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export { useToast };
export default useToast; 