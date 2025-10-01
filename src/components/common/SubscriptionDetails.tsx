import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../hooks/useSubscription';
import axios from 'axios';

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

interface SubscriptionDetailsProps {
  isRTL: boolean;
  selectedPlanId?: string;
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  onPriceChange?: (price: number) => void;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ 
  isRTL, 
  selectedPlanId,
  onPlanSelect,
  onPriceChange
}) => {
  const { t } = useTranslation();
  const { subscriptionStatus, isExpired, isExpiringSoon } = useSubscription();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // جلب خطط الاشتراك المتاحة
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/subscription-plans/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlans(response.data.data || []);
      
      // إذا كان هناك خطة محددة مسبقاً، اخترها
      if (selectedPlanId) {
        const plan = response.data.data.find((p: SubscriptionPlan) => p.id === selectedPlanId);
        if (plan) {
          setSelectedPlan(plan);
          setCustomPrice(plan.price);
          onPlanSelect?.(plan);
          onPriceChange?.(plan.price);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    fetchPlans();
  }, [selectedPlanId]);

  // معالجة اختيار الخطة
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCustomPrice(plan.price);
    onPlanSelect?.(plan);
    onPriceChange?.(plan.price);
    
    // حفظ بيانات الخطة في localStorage
    localStorage.setItem('selected_plan_id', plan.id);
    localStorage.setItem('selected_plan_name', plan.name);
    localStorage.setItem('selected_plan_nameAr', plan.nameAr);
    localStorage.setItem('selected_plan_type', plan.type);
    localStorage.setItem('selected_plan_duration', plan.duration.toString());
    localStorage.setItem('selected_plan_price', plan.price.toString());
    localStorage.setItem('selected_plan_currency', plan.currency);
  };



  const getStatusColor = () => {
    if (isExpired()) return 'text-red-600 bg-red-50 border-red-200';
    if (isExpiringSoon()) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isExpired()) return isRTL ? 'منتهي الصلاحية' : 'inactive';
    if (isExpiringSoon()) return isRTL ? 'ينتهي قريباً' : 'Expiring Soon';
    return isRTL ? 'نشط' : 'Active';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'Not set';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US');
  };

  // الحصول على رمز العملة
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      ILS: '₪',
      JOD: 'د.أ'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}
      </h3>
      
      <div className="space-y-4">
        {/* Current Subscription Status */}
        <div className="space-y-3">
          {/* Status */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'الحالة' : 'Status'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Current Plan */}
         

          {/* Current Amount */}
          {subscriptionStatus.amount > 0 && (
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'المبلغ الحالي' : 'Current Amount'}
              </span>
              <span className="text-sm text-gray-900">
                {subscriptionStatus.amount} {subscriptionStatus.currency}
              </span>
            </div>
          )}

          {/* Expiry Date */}
          {subscriptionStatus.expiresAt && (
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </span>
              <span className={`text-sm ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-yellow-600' : 'text-gray-900'}`}>
                {formatDate(subscriptionStatus.expiresAt)}
              </span>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className={`border-t pt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h4 className={`text-md font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'خطط الاشتراك المتاحة' : 'Available Plans'}
          </h4>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="font-medium text-gray-900">
                        {isRTL ? plan.nameAr : plan.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isRTL ? plan.durationTextAr : plan.durationText}
                      </div>
                    </div>
                    <div className={`text-right ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className="font-semibold text-primary">
                        {getCurrencySymbol(plan.currency)}{plan.price}
                      </div>
                      {plan.isPopular && (
                        <div className="text-xs text-yellow-600 font-medium">
                          {isRTL ? 'شائع' : 'Popular'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Price Input */}
        <div className="border-t pt-4">
          {/* <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'السعر المخصص' : 'Custom Price'}
          </label>
          <input
            type="number"
            value={customPrice}
            onChange={handlePriceChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            placeholder={isRTL ? 'أدخل السعر' : 'Enter price'}
          /> */}
        </div>

        {/* Warning Messages */}
        {isExpired() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للاستمرار في استخدام جميع الميزات.'
                : 'Your subscription has expired. Please renew your subscription to continue using all features.'
              }
            </p>
          </div>
        )}

        {isExpiringSoon() && !isExpired() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className={`text-sm text-yellow-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'اشتراكك سينتهي قريباً. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.'
                : 'Your subscription will expire soon. Please renew your subscription to avoid service interruption.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
