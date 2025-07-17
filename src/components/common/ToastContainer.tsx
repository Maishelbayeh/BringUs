import React from 'react';
import { Toast } from '../../Types';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const { language, isRTL } = useLanguage();
  
  // //CONSOLE.log('ToastContainer rendered with toasts:', toasts.length, toasts);
  // //CONSOLE.log('Current language:', language, 'isRTL:', isRTL);
  
  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-100 border-red-300';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300';
      case 'info':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  const getTextColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed ${isRTL ? 'top-4 right-4' : 'top-4 left-4'} z-[9999] space-y-3 pointer-events-none`}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full p-4 rounded-xl border-2 shadow-2xl transition-all duration-500 ease-out transform pointer-events-auto bg-white ${
            toast.isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-100%] opacity-0 scale-95'
          } ${getBackgroundColor(toast.type)}`}
          style={{ 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            borderWidth: '2px',
            animationDelay: `${index * 100}ms`,
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          <div className={`flex items-start space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              {toast.title && (
                <h4 className={`text-sm font-semibold ${getTextColor(toast.type)}`}>
                  {toast.title}
                </h4>
              )}
              <p className={`text-sm ${getTextColor(toast.type)} mt-1`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className={`flex-shrink-0 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1.5 rounded-full hover:bg-gray-100 hover:scale-110 ${isRTL ? 'mr-2' : 'ml-2'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 