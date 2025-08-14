import React, { useState, useEffect, useRef } from 'react';
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

  if (!isOpen) return null;

  const getStatusIcon = () => {
    if (isVerifying) {
      return (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      );
    }

    if (!result) return null;

    switch (result.data.data.status.toLowerCase()) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'input':
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
    if (!result) return 'text-gray-600';

    switch (result.data.data.status.toLowerCase()) {
      case 'success':
        return 'text-green-600';
      case 'input':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusTitle = () => {
    if (isVerifying) return t('payment.verifying');
    if (!result) return t('payment.unknown');

    switch (result.data.data.status.toLowerCase()) {
      case 'success':
        return t('payment.success');
      case 'input':
        return t('payment.failed');
      case 'pending':
        return t('payment.pending');
      default:
        return t('payment.unknown');
    }
  };

  return (
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
              <p className="mt-2 text-sm text-gray-600">
                {result.message}
              </p>
            )}

            {/* Payment Details */}
            {result?.data?.data && (
              <div className={`mt-6 text-left bg-gray-50 rounded-lg p-4  ${isRTL ? 'text-right' : 'text-left'}`}>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('payment.details')}
                </h4>
                <div className={`space-y-1 text-sm text-gray-600 flex flex-col ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex justify-between  ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{t('payment.reference')}:</span>
                    <span className="font-mono">{result.data.data.reference || result.data.data.id}</span>
                  </div>
                  {result.data.data.amount && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t('payment.amount')}:</span>
                      <span>{result.data.data.amount} {result.data.data.currency}</span>
                    </div>
                  )}
                  {result.data.data.status && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t('payment.status')}:</span>
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
            {t('general.close')}
          </button>
          {result?.data?.data?.status?.toLowerCase() === 'success' && (
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
      
      {/* Auto Renewal Setup Modal */}
      {showAutoRenewalSetup && (
        <AutoRenewalSetup
          isOpen={showAutoRenewalSetup}
          onClose={() => setShowAutoRenewalSetup(false)}
          isRTL={isRTL}
          referenceId={result?.data?.data?.authorization.authorization_code  || ''}
        />
      )}
    </div>
  );
};

export default PaymentVerificationResult;
