import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from '@/hooks/useLanguage';
import AddSubscriptionPlanModal from './AddSubscriptionPlanModal';
import axios from 'axios';

interface SubscriptionPlan {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'free' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom';
  duration: number;
  price: number;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const SubscriptionPlans: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { showSuccess, showError } = useToastContext();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // جلب خطط الاشتراك
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlans(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // معالجة نجاح إضافة الخطة
  const handlePlanAdded = () => {
    showSuccess('Subscription plan added successfully', t('general.success'));
    fetchPlans(); // إعادة جلب الخطط
  };

  // الحصول على نوع الخطة مترجم
  const getPlanTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      free: t('subscriptionPlans.free'),
      monthly: t('subscriptionPlans.monthly'),
      quarterly: t('subscriptionPlans.quarterly'),
      semi_annual: t('subscriptionPlans.semiAnnual'),
      annual: t('subscriptionPlans.annual'),
      custom: t('subscriptionPlans.custom')
    };
    return typeMap[type] || type;
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

  // ترتيب الخطط حسب الترتيب والشعبية
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="min-h-screen p-4">
      <div className="">
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            { name: t('sideBar.dashboard'), href: '/' },
            { name: t('subscriptionPlans.title'), href: '/superadmin/subscription-plans' }
          ]}
          isRtl={isRTL}
        />

        {/* Header */}
        <HeaderWithAction
          title={t('subscriptionPlans.title')}
          addLabel=""
          isRtl={isRTL}
          count={plans.length}
          loading={isLoading}
        />

        {/* Add Plan Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('subscriptionPlans.addNewPlan')}
          </button>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('subscriptionPlans.noPlans')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('subscriptionPlans.addNewPlan')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPlans.map((plan) => (
              <div
                key={plan._id}
                className={`relative bg-white rounded-lg shadow-md border-2 transition-all duration-200 hover:shadow-lg ${
                  plan.isPopular 
                    ? 'border-yellow-400 shadow-yellow-100' 
                    : plan.isActive 
                      ? 'border-green-200' 
                      : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 -right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <StarIcon className="w-3 h-3" />
                    {t('subscriptionPlans.popular')}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {plan.isActive ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="p-6">
                  {/* Plan Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {isRTL ? plan.nameAr : plan.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isRTL ? plan.descriptionAr : plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary">
                      {plan.price === 0 ? (
                        t('subscriptionPlans.free')
                      ) : (
                        <>
                          {getCurrencySymbol(plan.currency)}{plan.price}
                          <span className="text-sm text-gray-500 ml-1">
                            /{getPlanTypeLabel(plan.type)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t('subscriptionPlans.planType')}:</span>
                      <span className="font-medium">{getPlanTypeLabel(plan.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('subscriptionPlans.durationDays')}:</span>
                      <span className="font-medium">{plan.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('subscriptionPlans.currency')}:</span>
                      <span className="font-medium">{plan.currency}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {t('subscriptionPlans.isActive')}:
                      </span>
                      <span className={`text-sm font-medium ${
                        plan.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.isActive ? t('subscriptionPlans.active') : t('subscriptionPlans.inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Plan Modal */}
        <AddSubscriptionPlanModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handlePlanAdded}
        />
      </div>
    </div>
  );
};

export default SubscriptionPlans;
