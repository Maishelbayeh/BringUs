import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useUserStore } from '@/hooks/useUserStore';
import { useToastContext } from '@/contexts/ToastContext';
import { getErrorMessage, getPredefinedErrorMessage } from '@/utils/errorUtils';
import { getAuthToken } from '@/utils/authUtils';

interface AutoRenewalSetupProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
  referenceId: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  duration: number;
  price: number;
  currency: string;
}

const AutoRenewalSetup: React.FC<AutoRenewalSetupProps> = ({
  isOpen,
  onClose,
  isRTL,
  referenceId
}) => {
  console.log('AutoRenewalSetup - referenceId:', referenceId);
  const { t } = useTranslation();
  const { storeId } = useUserStore();
  const { showSuccess, showError } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // جلب الخطة المختارة من localStorage
  useEffect(() => {
    if (isOpen) {
      const planId = localStorage.getItem('selected_plan_id');
      const planName = localStorage.getItem('selected_plan_name');
      const planNameAr = localStorage.getItem('selected_plan_nameAr');
      const planType = localStorage.getItem('selected_plan_type');
      const planDuration = localStorage.getItem('selected_plan_duration');
      const planPrice = localStorage.getItem('selected_plan_price');
      const planCurrency = localStorage.getItem('selected_plan_currency');

      if (planId && planName) {
        setSelectedPlan({
          id: planId,
          name: planName,
          nameAr: planNameAr || planName,
          type: planType || '',
          duration: parseInt(planDuration || '0'),
          price: parseFloat(planPrice || '0'),
          currency: planCurrency || 'USD'
        });
      }

      // تعيين التواريخ الافتراضية
      const now = new Date();
      const end = new Date();
      end.setDate(end.getDate() + parseInt(planDuration || '30'));
      
      setStartDate(now.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !storeId) return;

    setIsLoading(true);
    try {
      const subscriptionData = {
        planId: selectedPlan.id,
        referenceId: autoRenew ? referenceId : '',
        autoRenew: autoRenew,
        startDate: `${startDate}T00:00:00.000Z`,
        endDate: `${endDate}T23:59:59.999Z`
      };

      const response = await axios.post(
        `https://bringus-backend.onrender.com/subscription/stores/${storeId}`,
        subscriptionData,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if(response.status === 200){
        onClose();
        onClose();

        // Show success message using utility function
        const successMsg = getPredefinedErrorMessage('SUBSCRIPTION_SETUP_SUCCESS', isRTL);
        showSuccess(successMsg.title, successMsg.message);
        onClose();
      }else{
        // Handle error response with language support using utility function
        const errorMsg = getErrorMessage(response.data, isRTL, {
          title: isRTL ? 'خطأ في الإعداد' : 'Setup Error',
          message: isRTL ? 'فشل في إعداد الاشتراك' : 'Failed to setup subscription'
        });
        showError(errorMsg.title, errorMsg.message);
      }
      
      // حفظ إعدادات التجديد التلقائي في localStorage
      localStorage.setItem('auto_renewal_enabled', autoRenew.toString());
      localStorage.setItem('subscription_reference_id', referenceId);
      
      // لا نغلق النافذة تلقائياً - المستخدم يغلقها بنفسه
      // setTimeout(() => {
      //   onClose();
      // }, 2000);

    } catch (error: any) {
      console.error('Error setting up subscription:', error);
      
      // Handle error messages using utility function
      const errorMsg = getErrorMessage(error, isRTL, {
        title: isRTL ? 'خطأ في الإعداد' : 'Setup Error',
        message: isRTL ? 'فشل في إعداد الاشتراك' : 'Failed to setup subscription'
      });
      
      showError(errorMsg.title, errorMsg.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      ILS: '₪',
      JOD: 'د.أ'
    };
    return symbols[currency] || currency;
  };

  console.log('AutoRenewalSetup - isOpen:', isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full h-[80vh] flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'إعداد الاشتراك' : 'Subscription Setup'}
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
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selected Plan Info */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`font-medium text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'الخطة المختارة' : 'Selected Plan'}
              </h3>
              <div className={`space-y-1 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'الاسم' : 'Name'}:</span>
                  <span className="font-medium">{isRTL ? selectedPlan.nameAr : selectedPlan.name}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'النوع' : 'Type'}:</span>
                  <span>{selectedPlan.type}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'السعر' : 'Price'}:</span>
                  <span>{getCurrencySymbol(selectedPlan.currency)}{selectedPlan.price}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span dir={isRTL ? 'rtl' : 'ltr'}>{isRTL ? 'المدة' : 'Duration'}:</span>
                  <span>{selectedPlan.duration} {isRTL ? 'يوم' : 'days'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Auto Renewal Toggle */}
          <div className="flex items-center justify-between" >
            <label className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'التجديد التلقائي' : 'Auto Renewal'}
            </label>
            <button
              type="button"
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                autoRenew ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reference ID Field (only shown when auto-renewal is enabled) 
          {autoRenew && (
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'رقم المرجع' : 'Reference ID'}
              </label>
              <input
                type="text"
                value={referenceId}
                readOnly
                className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                placeholder={isRTL ? 'سيتم ملؤه تلقائياً' : 'Will be filled automatically'}
              />
              <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'سيتم استخدام هذا الرقم للتجديد التلقائي' : 'This ID will be used for auto-renewal'}
              </p>
            </div>
          )}
*/}
          {/* Start Date */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'تاريخ البداية' : 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            />
          </div>

          {/* End Date */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className={`text-sm text-blue-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {autoRenew 
                ? (isRTL 
                    ? 'سيتم تجديد اشتراكك تلقائياً عند انتهاء المدة'
                    : 'Your subscription will be automatically renewed when it expires')
                : (isRTL 
                    ? 'ستحتاج لتجديد اشتراكك يدوياً عند انتهاء المدة'
                    : 'You will need to manually renew your subscription when it expires')
              }
            </p>
          </div>
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className={`flex gap-3 p-6 border-t border-gray-200 mt-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('general.cancel')}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isRTL ? 'جاري الإعداد...' : 'Setting up...'}
              </div>
            ) : (
              isRTL ? 'إعداد الاشتراك' : 'Setup Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoRenewalSetup;
