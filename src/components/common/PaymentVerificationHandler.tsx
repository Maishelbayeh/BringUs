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
      // التحقق من وجود reference في URL أو localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference') || urlParams.get('tap_id');
      
      if (reference) {
        // إذا كان هناك reference في URL، قم بالتحقق
        const result = await checkPaymentFromURL();
        if (result) {
          setShowVerificationModal(true);
          
          // إزالة المعاملات من URL بعد التحقق
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('reference');
          newUrl.searchParams.delete('tap_id');
          window.history.replaceState({}, '', newUrl.toString());
        }
      } else {
        // التحقق من localStorage إذا لم يكن هناك reference في URL
        const storedReference = localStorage.getItem('reference');
        if (storedReference) {
          // يمكن إضافة منطق إضافي هنا للتحقق من الدفع المحفوظ
          console.log('Stored payment reference found:', storedReference);
        }
      }
    };

    handlePaymentVerification();
  }, [checkPaymentFromURL]);

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
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
