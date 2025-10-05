import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useOTP from '../../hooks/useOTP';
import useLanguage from '../../hooks/useLanguage';
import { 
  CheckCircle, 
  Refresh,
  Security
} from '@mui/icons-material';

interface OTPVerificationProps {
  email: string;
  onResendCode?: () => void;
  onBack?: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  email, 
  onResendCode, 
  
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { verifyOTP, resendOTP, loading, error: otpError, reset } = useOTP();
  const navigate = useNavigate();

  // 5-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Refs for input fields
  const inputRefs = [
    React.useRef<HTMLInputElement>(null), 
    React.useRef<HTMLInputElement>(null), 
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null), 
    React.useRef<HTMLInputElement>(null)
  ];

  const validateForm = useCallback(() => {
    const isValid = otp.every(digit => digit !== '');
    setIsFormValid(isValid);
    return isValid;
  }, [otp]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Clear error on typing
    if (otpError) {
      reset();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 5) {
      const newOtp = pastedData.split('').slice(0, 5);
      setOtp(newOtp);
      inputRefs[4].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const otpString = otp.join('');
      const result = await verifyOTP(email, otpString);
      if (result.success) {
        setShowSuccess(true);
        
        // الانتقال للهوم بيج بعد 3 ثوان
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      // Get storeSlug from URL or context
      const storeSlug = window.location.pathname.split('/')[1] || 'default';
      const result = await resendOTP(email, storeSlug);
      if (result.success) {
        setCountdown(60);
        onResendCode && onResendCode();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // إذا تم التحقق بنجاح، اعرض رسالة النجاح
  if (showSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 z-50">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              {/* Success Icon with Animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                  <CheckCircle className="text-white text-4xl" />
                </div>
                {/* Ripple Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-green-400 rounded-full mx-auto animate-ping opacity-20"></div>
              </div>
              
              {/* Success Title */}
              <h2 className={`text-3xl font-bold text-gray-800 mb-4 animate-pulse ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('auth.otp.successTitle', 'تم التحقق بنجاح!')}
              </h2>
              
              {/* Success Message */}
              <p className={`text-lg text-gray-600 mb-6 animate-pulse ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                {t('auth.otp.successMessage', 'تم التحقق من بريدك الإلكتروني بنجاح. مرحباً بك في BringUs!')}
              </p>
              
              {/* Loading Animation */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-green-500 border-t-transparent"></div>
                <span className={`text-base text-gray-600 font-medium ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                  {t('auth.otp.redirecting', 'جاري الانتقال...')}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 z-50">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Security className="text-white text-2xl" />
            </div>
            <h1 className={`text-3xl font-bold text-gray-800 mb-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
              {t('auth.otp.title')}
            </h1>
            <p className={`text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
              {t('auth.otp.subtitle')}<br />
              <strong className="text-blue-600">{email}</strong>
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {otpError}
              </div>
            )}
            
            {/* OTP Input Section */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold text-gray-800 flex items-center gap-2 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                <CheckCircle className="text-green-500" />
                {t('auth.otp.verification_code')}
              </h3>
              
              <div className="space-y-4">
                <p className={`text-sm text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                  {t('auth.otp.enter_code')}
                </p>
                
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      maxLength={1}
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                !isFormValid || loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105'
              }`}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('auth.otp.verifying')}
                </>
              ) : (
                <>
                  <CheckCircle className="text-lg" />
                  {t('auth.otp.verify')}
                </>
              )}
            </button>
          </form>
          
          {/* Resend Section */}
          <div className="mt-6 text-center space-y-3">
            <p className={`text-sm text-gray-600 ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
              {t('auth.otp.didnt_receive')}
            </p>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                countdown > 0 || resendLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              onClick={handleResendCode}
              disabled={resendLoading || countdown > 0}
            >
              {resendLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  {t('auth.otp.sending')}
                </>
              ) : countdown > 0 ? (
                <>
                  <Refresh className="text-lg" />
                  {t('auth.otp.resend_in', { seconds: countdown })}
                </>
              ) : (
                <>
                  <Refresh className="text-lg" />
                  {t('auth.otp.resend_code')}
                </>
              )}
            </button>
          </div>
          
          {/* Footer */}
    
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
