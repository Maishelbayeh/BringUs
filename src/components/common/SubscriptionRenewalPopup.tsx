import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { PAYMENT_API_CONFIG, CURRENCY_CONVERSION, SUPPORTED_CURRENCIES } from '../../constants/payment';
import SubscriptionDetails from './SubscriptionDetails';



interface SubscriptionRenewalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  storeId?: string;
  userId?: string;
}

interface PaymentFormData {
  amount: string;
  email: string;
  currency: 'ILS' | 'JOD' | 'USD';
  first_name: string;
  last_name: string;
  callback_url: string;
  metadata: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  duration: number;
  durationText: string;
  durationTextAr: string;
  price: number;
  currency: string;
  formattedPrice: string;
  isActive: boolean;
  isPopular: boolean;
  features: Array<{
    name: string;
    nameAr: string;
  }>;
}

const SubscriptionRenewalPopup: React.FC<SubscriptionRenewalPopupProps> = ({
  isOpen,
  onClose,
  isRTL,
  storeId = '',
  userId = ''
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    email: '',
    currency: 'USD',
    first_name: '',
    last_name: '',
    callback_url: PAYMENT_API_CONFIG.CALLBACK_URL,
    metadata: JSON.stringify({ storeId, userId })
  });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // إعادة تعيين النموذج عند فتح الـ popup
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: localStorage.getItem('subscription_amount') || '',
        email: localStorage.getItem('subscription_email') || localStorage.getItem('email') || '',
        currency: (localStorage.getItem('subscription_currency') as 'ILS' | 'JOD' | 'USD') || 'USD',
        first_name: localStorage.getItem('subscription_first_name') || localStorage.getItem('userName') || '',
        last_name: localStorage.getItem('subscription_last_name') || localStorage.getItem('userLastName') || '',
        callback_url: localStorage.getItem('subscription_callback_url') || PAYMENT_API_CONFIG.CALLBACK_URL,
        metadata: localStorage.getItem('subscription_metadata') || JSON.stringify({ storeId, userId })
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, storeId, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // معالجة اختيار الخطة
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      amount: plan.price.toString(),
      currency: plan.currency as 'ILS' | 'JOD' | 'USD'
    }));
  };

  // معالجة تغيير السعر
  const handlePriceChange = (price: number) => {
    setFormData(prev => ({
      ...prev,
      amount: price.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // تحويل المبلغ إلى العملة المطلوبة
      const conversionRate = CURRENCY_CONVERSION[formData.currency as keyof typeof CURRENCY_CONVERSION];
      const convertedAmount = (parseFloat(formData.amount) * conversionRate).toString();

      const paymentData = {
        ...formData,
        amount: convertedAmount,
        metadata: JSON.stringify({ storeId, userId })
      };

      // Console log the payment initialization body
      console.log('🚀 Payment Initialize Request Body:', JSON.stringify(paymentData, null, 2));
      console.log('🔑 Using Secret Key:', PAYMENT_API_CONFIG.SECRET_KEY);
      console.log('🌐 Request URL:', `${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.CHARGES}`);

      const response = await axios.post(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.CHARGES}`, paymentData, {
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment response:', response.data);
      setSuccess(t('subscription.paymentSuccess'));
      localStorage.setItem('authorization_url',response.data.data.authorization_url);
      localStorage.setItem('access_code',response.data.data.access_code);
      localStorage.setItem('reference',response.data.data.reference);


             // حفظ جميع البيانات في localStorage
       localStorage.setItem('subscription_amount', formData.amount);
       localStorage.setItem('subscription_email', formData.email);
       localStorage.setItem('subscription_currency', formData.currency);
       localStorage.setItem('subscription_first_name', formData.first_name);
       localStorage.setItem('subscription_last_name', formData.last_name);
       localStorage.setItem('subscription_callback_url', formData.callback_url);
       localStorage.setItem('subscription_metadata', formData.metadata);
       localStorage.setItem('subscription_converted_amount', convertedAmount);
       localStorage.setItem('subscription_payment_date', new Date().toISOString());
      
             // إغلاق الـ popup بعد ثانيتين
       setTimeout(() => {
         onClose();
       }, 1000);
       console.log(response.data.data.authorization_url);
       // Redirect to external payment URL
       window.location.href = response.data.data.authorization_url;

       

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(
        `${t('subscription.paymentError')}: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full h-[80vh] overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('subscription.title')}
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

        {/* Subscription Details */}
        <div className="p-6 border-b border-gray-200">
          <SubscriptionDetails 
            isRTL={isRTL} 
            selectedPlanId={selectedPlan?.id}
            onPlanSelect={handlePlanSelect}
            onPriceChange={handlePriceChange}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('subscription.amount')}
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              disabled={true}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                isRTL ? 'text-right' : 'text-left'
              } ${true ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder={selectedPlan ? (isRTL ? 'السعر محدد من الخطة المختارة' : 'Price set from selected plan') : t('subscription.enterAmount')}
            />
            {selectedPlan && (
              <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'السعر محدد من الخطة المختارة' : 'Price is set from the selected plan'}
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('subscription.currency')}
            </label>
            <input
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              required
              disabled={true}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                isRTL ? 'text-right' : 'text-left'
              } ${true ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            
            {selectedPlan && (
              <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'العملة محددة من الخطة المختارة' : 'Currency is set from the selected plan'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('subscription.email')}
            </label>
            <input
              type="email"
              name="email"
              disabled={true}
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('subscription.enterEmail')}
            />
          </div>

          {/* First Name */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('subscription.firstName')}
            </label>
            <input
              type="text"
              name="first_name"
              disabled={true}
              value={formData.first_name}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('subscription.enterFirstName')}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('subscription.lastName')}
            </label>
            <input
              type="text"
              name="last_name"
              disabled={true}
              value={formData.last_name}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('subscription.enterLastName')}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('general.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('subscription.processing')}
                </div>
              ) : (
                t('subscription.sendPaymentRequest')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionRenewalPopup;
