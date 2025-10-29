import React, { useEffect, useState } from 'react';
import { usePaymentVerification } from '../../hooks/usePaymentVerification';
import PaymentVerificationResult from './PaymentVerificationResult';
import useLanguage from '../../hooks/useLanguage';

const PaymentVerificationHandler: React.FC = () => {
  const { checkPaymentFromURL, isVerifying, verificationResult } = usePaymentVerification();
  const { language } = useLanguage();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const handlePaymentVerification = async () => {
      try {
        // التحقق من وجود reference في URL أو localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference') || urlParams.get('tap_id') || urlParams.get('trxref');
        
        console.log('🔍 Checking for payment reference in URL:', { reference, allParams: Object.fromEntries(urlParams.entries()) });
        
        if (reference) {
          // Save reference to localStorage for backup
          localStorage.setItem('payment_reference', reference);
          
          // إذا كان هناك reference في URL، قم بالتحقق
          console.log('✅ Found payment reference, verifying...');
          const result = await checkPaymentFromURL();
          
          if (result) {
            // وضع flag فوراً قبل فتح النافذة لمنع reload من PaymentPollingManager
            if (result.status === 'success') {
              console.log('🔒 Setting payment_verification_modal_open flag to prevent reload...');
              localStorage.setItem('payment_verification_modal_open', 'true');
            }
            
            setShowVerificationModal(true);
            
            // إزالة المعاملات من URL بعد التحقق
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('reference');
            newUrl.searchParams.delete('tap_id');
            newUrl.searchParams.delete('trxref');
            window.history.replaceState({}, '', newUrl.toString());
          }
        } else {
          // التحقق من localStorage إذا لم يكن هناك reference في URL
          const storedReference = localStorage.getItem('payment_reference');
          if (storedReference) {
            console.log('📦 Stored payment reference found:', storedReference);
          }
        }
      } catch (error) {
        console.error('❌ Error in payment verification handler:', error);
      }
    };

    handlePaymentVerification();
  }, [checkPaymentFromURL]);

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    // إزالة flag من localStorage عند إغلاق النافذة
    localStorage.removeItem('payment_verification_modal_open');
  };

  return (
    <PaymentVerificationResult
      isOpen={showVerificationModal}
      onClose={handleCloseVerificationModal}
      isRTL={language === 'ARABIC'}
      result={verificationResult}
      isVerifying={isVerifying}
    />
  );
};

export default PaymentVerificationHandler;
