import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AutoRenewalSetup from './AutoRenewalSetup';

interface PaymentVerificationResultProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  result: {
    success: boolean;
    status: 'pending' | 'success' | 'failed' | 'unknown';
    message: string;
    data?: any;
  } | null;
  isVerifying: boolean;
}

const PaymentVerificationResult: React.FC<PaymentVerificationResultProps> = ({
  isOpen,
  onClose,
  isRTL,
  result,
  isVerifying
}) => {
  const { t } = useTranslation();
  const [showAutoRenewalSetup, setShowAutoRenewalSetup] = useState(false);
  const [shouldCloseFirstModal, setShouldCloseFirstModal] = useState(false);
  const [hasOpenedAutoRenewal, setHasOpenedAutoRenewal] = useState(false);

  // فتح نافذة إعداد الاشتراك التلقائي تلقائياً بعد نجاح الدفع
  useEffect(() => {
    // إذا كانت النتيجة نجحت ولم يتم فتح نافذة الإعداد بعد والنافذة الحالية مفتوحة
    if (
      isOpen && 
      !isVerifying && 
      result?.status?.toLowerCase() === 'success' && 
      !hasOpenedAutoRenewal &&
      !showAutoRenewalSetup
    ) {
      // انتظر 1.5 ثانية لعرض رسالة النجاح ثم افتح نافذة الإعداد
      const timer = setTimeout(() => {
        setHasOpenedAutoRenewal(true);
        setShowAutoRenewalSetup(true);
        // إغلاق نافذة النتيجة بعد فتح نافذة الإعداد
        onClose();
      }, 1500); // انتظر 1.5 ثانية لعرض رسالة النجاح
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVerifying, result, hasOpenedAutoRenewal, showAutoRenewalSetup, onClose]);

  // فتح نافذة الإعداد إذا تم إغلاق نافذة النتيجة يدوياً ولكن الدفع نجح
  useEffect(() => {
    // إذا كانت النافذة مغلقة والدفع نجح ولم يتم فتح نافذة الإعداد بعد
    if (
      !isOpen && 
      result?.status?.toLowerCase() === 'success' && 
      !hasOpenedAutoRenewal &&
      !showAutoRenewalSetup
    ) {
      // افتح نافذة الإعداد تلقائياً حتى لو تم إغلاق نافذة النتيجة
      const timer = setTimeout(() => {
        setHasOpenedAutoRenewal(true);
        setShowAutoRenewalSetup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, result, hasOpenedAutoRenewal, showAutoRenewalSetup]);

  // إعادة تعيين الحالة عند فتح النافذة من جديد
  useEffect(() => {
    if (isOpen && isVerifying) {
      setHasOpenedAutoRenewal(false);
      setShowAutoRenewalSetup(false);
    }
  }, [isOpen, isVerifying]);

  // إغلاق النافذة الأولى بعد فتح النافذة الثانية
  useEffect(() => {
    if (shouldCloseFirstModal) {
      const timer = setTimeout(() => {
        onClose();
        setShouldCloseFirstModal(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldCloseFirstModal, onClose]);

  // إذا كانت النافذة مغلقة ولم يكن هناك نافذة إعداد مفتوحة، لا نعرض شيئاً
  if (!isOpen && !showAutoRenewalSetup) return null;

  const getStatusIcon = () => {
    if (isVerifying) {
      return (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      );
    }

    if (!result || !result.status) return null;

    const status = result.status.toLowerCase();

    switch (status) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'input':
      case 'failed':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    if (isVerifying) return 'text-blue-600';
    if (!result || !result.status) return 'text-gray-600';

    const status = result.status.toLowerCase();

    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'input':
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusTitle = () => {
    if (isVerifying) return t('payment.verifying');
    if (!result || !result.status) return t('payment.unknown');

    const status = result.status.toLowerCase();

    switch (status) {
      case 'success':
        return t('payment.success');
      case 'input':
      case 'failed':
        return t('payment.failed');
      case 'pending':
        return t('payment.pending');
      default:
        return t('payment.unknown');
    }
  };

  return (
    <>
      {/* Payment Verification Result Modal - تعرض فقط إذا كانت مفتوحة */}
      {isOpen && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 flex-col  ${isRTL ? 'row-reverse' : ''}`}>
          <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200   ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('payment.verificationTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center">
            {getStatusIcon()}
            
            <h3 className={`mt-4 text-lg font-medium ${getStatusColor()}`}>
              {getStatusTitle()}
            </h3>
            
            {result && (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  {result.message}
                </p>
                {result.status?.toLowerCase() === 'success' && !hasOpenedAutoRenewal && (
                  <p className="mt-3 text-sm text-blue-600 font-medium animate-pulse">
                    {isRTL 
                      ? 'سيتم فتح نافذة إعداد الاشتراك تلقائياً...'
                      : 'Subscription setup window will open automatically...'}
                  </p>
                )}
              </>
            )}

            {/* Payment Details */}
            {result?.data?.data && (
              <div className={`mt-6 text-left bg-gray-50 rounded-lg p-4  ${isRTL ? 'text-right' : 'text-left'}`}>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('payment.details')}
                </h4>
                <div className={`space-y-1 text-sm text-gray-600 flex flex-col ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* <div className={`flex justify-between  ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{t('payment.reference')}:</span>
                    <span className="font-mono">{result.data.data.reference || result.data.data.id}</span>
                  </div> */}
                  {result.data.data.amount && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{t('payment.amount')}:</span>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{(result.data.data.amount / 100).toFixed(2)} {result.data.data.currency}</span>
                    </div>
                  )}
                  {result.data.data.status && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>{t('payment.status')}:</span>
                      <span className="capitalize">{result.data.data.status.toLowerCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('general.cancel')}
          </button>
          {result?.status?.toLowerCase() === 'success' && (
            <button
              onClick={() => {
                console.log('Setting up auto renewal...');
                setShowAutoRenewalSetup(true);
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              {isRTL ? 'إعداد الاشتراك' : 'Setup Subscription'}
            </button>
          )}
        </div>
      </div>
      )}
      
      {/* Auto Renewal Setup Modal - يمكن عرضها حتى لو كانت نافذة النتيجة مغلقة */}
      {showAutoRenewalSetup && (
        <AutoRenewalSetup
          isOpen={showAutoRenewalSetup}
          onClose={() => {
            setShowAutoRenewalSetup(false);
            setHasOpenedAutoRenewal(false);
            // إزالة flag من localStorage عند إغلاق النافذة يدوياً (بدون حفظ)
            localStorage.removeItem('auto_renewal_setup_open');
            
            // عمل reload بعد إغلاق النافذة (إذا أُغلقت بدون حفظ)
            setTimeout(() => {
              console.log('🔄 Reloading page after closing subscription setup without saving...');
              window.location.reload();
            }, 1000);
          }}
          isRTL={isRTL}
          referenceId={result?.data?.data?.authorization?.authorization_code || result?.data?.data?.reference || ''}
        />
      )}
    </>
  );
};

export default PaymentVerificationResult;
