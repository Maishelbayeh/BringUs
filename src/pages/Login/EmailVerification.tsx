import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OTPVerification from '../../components/Auth/OTPVerification';
import useOTP from '../../hooks/useOTP';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const { sendOTP} = useOTP();
  const hasSentOTP = useRef(false);

  // إرسال رمز التحقق تلقائياً عند تحميل الصفحة (مرة واحدة فقط)
  useEffect(() => {
    if (email && !hasSentOTP.current) {
      hasSentOTP.current = true;
      // الحصول على storeSlug من الـ URL أو استخدام 'default'
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      sendOTP(email, storeSlug);
    }
  }, [email, sendOTP]);

  const handleBack = () => {
    navigate('/login');
  };

  const handleResendCode = () => {
    // This will be handled by the OTPVerification component
    console.log('Resend code requested');
  };

  return (
    <OTPVerification
      email={email}
      onBack={handleBack}
      onResendCode={handleResendCode}
    />
  );
};

export default EmailVerification;
