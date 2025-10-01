import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from '@/hooks/useLanguage';
import AddSubscriptionPlanModal from './AddSubscriptionPlanModal';
import axios from 'axios';

interface Feature {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  included: boolean;
}

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
  features: Feature[];
  maxProducts: number;
  maxOrders: number;
  maxUsers: number;
  storageLimit: number;
}

const SubscriptionPlans: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { showSuccess, showError } = useToastContext();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // جلب خطط الاشتراك
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://https://bringus-backend.onrender.com/api/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlans(response.data.data || []);
      console.log(response.data.data);
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

  // معالجة نجاح تحديث الخطة
  const handlePlanUpdated = () => {
    showSuccess('Subscription plan updated successfully', t('general.success'));
    fetchPlans();
    setShowEditModal(false);
    setSelectedPlan(null);
  };

  // معالجة نجاح حذف الخطة
  const handlePlanDeleted = () => {
    showSuccess('Subscription plan deleted successfully', t('general.success'));
    fetchPlans();
    setShowDeleteModal(false);
    setSelectedPlan(null);
  };

  // تبديل حالة الخطة (نشط/غير نشط)
  const togglePlanStatus = async (planId: string) => {
    setActionLoading(planId);
    try {
      await axios.post(`https://https://bringus-backend.onrender.com/api/subscription-plans/${planId}/toggle`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      showSuccess('Plan status updated successfully', t('general.success'));
      fetchPlans();
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to update plan status');
    } finally {
      setActionLoading(null);
    }
  };

  // تعيين الخطة كشائعة
  const togglePlanPopular = async (planId: string , isPopular: boolean) => {
    setActionLoading(planId);
    const body = {
      isPopular: !isPopular
    };
    try {
      await axios.post(`https://https://bringus-backend.onrender.com/api/subscription-plans/${planId}/popular`, body, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      showSuccess('Plan popularity updated successfully', t('general.success'));
      fetchPlans();
    } catch (error: any) {
      console.error('Error toggling plan popularity:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to update plan popularity');
    } finally {
      setActionLoading(null);
    }
  };

  // حذف الخطة
  const deletePlan = async (planId: string) => {
    setActionLoading(planId);
    try {
      await axios.delete(`https://https://bringus-backend.onrender.com/api/subscription-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      handlePlanDeleted();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to delete plan');
    } finally {
      setActionLoading(null);
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  // فتح نافذة الحذف
  const openDeleteModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  // فتح نافذة العرض
  const openViewModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowViewModal(true);
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
        
        {/* Quick Navigation */}
        {/* <div className={`mb-4 flex gap-2 ${isRTL ? 'justify-end ' : 'justify-start '}`}>
          <button
            onClick={() => window.location.href = '/superadmin/stores'}
            className={`text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <svg className={`w-4 h-4 ${isRTL ? 'text-right justify-end' : 'text-left justify-start'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {isRTL ? 'إدارة المتاجر' : 'Stores Management'}
          </button>
        </div> */}

        {/* Action Buttons */}
        <div className={`mb-6 flex gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={() => setShowAddModal(true)}
            className={`bg-primary text-white px-4 py-2  rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
         
         <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isRTL ? 'rtl' : 'ltr'}`}
         style={{ direction: isRTL ? 'rtl' : 'ltr' }}
>
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
                  <div className={`absolute -top-3 ${isRTL ? '-left-3' : '-right-3'} bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                    <StarIcon className="w-3 h-3" />
                    {t('subscriptionPlans.popular')}
                  </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
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
                    <div className="text-3xl font-bold text-purple-600">
                      {plan.price === 0 ? (
                        t('subscriptionPlans.free')
                      ) : (
                        <>
                          {getCurrencySymbol(plan.currency)}{plan.price}
                          <span className={`text-sm text-gray-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                            /{getPlanTypeLabel(plan.type)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span>{t('subscriptionPlans.planType')}</span>
                      <span className="font-medium">{getPlanTypeLabel(plan.type)}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span>{t('subscriptionPlans.durationDays')}</span>
                      <span className="font-medium">{plan.duration}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span>{t('subscriptionPlans.currency')}</span>
                      <span className="font-medium">{plan.currency}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-sm text-gray-500">
                        {t('subscriptionPlans.isActive')}
                      </span>
                      <span className={`text-sm font-medium ${
                        plan.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.isActive ? t('subscriptionPlans.active') : t('subscriptionPlans.inactive')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* View Button */}
                      <button
                        onClick={() => openViewModal(plan)}
                        className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                       {isRTL ? 'عرض' : 'View'}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(plan)}
                        className="flex-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        {t('general.edit')}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => openDeleteModal(plan)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        {t('general.delete')}
                      </button>
                    </div>

                    {/* Toggle Buttons */}
                    <div className={`flex gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Toggle Status Button */}
                      <button
                        onClick={() => togglePlanStatus(plan._id)}
                        disabled={actionLoading === plan._id}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                          plan.isActive 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        } ${actionLoading === plan._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading === plan._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <>
                            {plan.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                            {plan.isActive ? t('subscriptionPlans.deactivate') : t('subscriptionPlans.activate')}
                          </>
                        )}
                      </button>

                      {/* Toggle Popular Button */}
                      <button
                        onClick={() => togglePlanPopular(plan._id, plan.isPopular)}
                        disabled={actionLoading === plan._id}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                          plan.isPopular 
                            ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' 
                            : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        } ${actionLoading === plan._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading === plan._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <>
                            <StarIcon className="w-4 h-4" />
                            {plan.isPopular ? t('subscriptionPlans.removePopular') : t('subscriptionPlans.makePopular')}
                          </>
                        )}
                      </button>
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

        {/* Edit Plan Modal */}
        {selectedPlan && (
          <AddSubscriptionPlanModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPlan(null);
            }}
            onSuccess={handlePlanUpdated}
            plan={selectedPlan}
            isEdit={true}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <TrashIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('general.confirmDelete')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('subscriptionPlans.deleteConfirmMessage', { 
                    planName: isRTL ? selectedPlan.nameAr : selectedPlan.name 
                  })}
                </p>
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPlan(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {t('general.cancel')}
                  </button>
                  <button
                    onClick={() => deletePlan(selectedPlan._id)}
                    disabled={actionLoading === selectedPlan._id}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedPlan._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : (
                      t('general.delete')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Plan Modal */}
        {showViewModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {isRTL ? selectedPlan.nameAr : selectedPlan.name}
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedPlan(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Plan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('subscriptionPlans.details')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.name')}:</span>
                        <span className="font-medium">{isRTL ? selectedPlan.nameAr : selectedPlan.name}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.description')}:</span>
                        <span className="font-medium">{isRTL ? selectedPlan.descriptionAr : selectedPlan.description}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.type')}:</span>
                        <span className="font-medium">{getPlanTypeLabel(selectedPlan.type)}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.duration')}:</span>
                        <span className="font-medium">{selectedPlan.duration} {t('subscriptionPlans.days')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('subscriptionPlans.pricing')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.price')}:</span>
                        <span className="font-medium text-lg text-purple-600">
                          {selectedPlan.price === 0 ? (
                            t('subscriptionPlans.free')
                          ) : (
                            `${getCurrencySymbol(selectedPlan.currency)}${selectedPlan.price}`
                          )}
                        </span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-gray-500">{t('subscriptionPlans.currency')}:</span>
                        <span className="font-medium">{selectedPlan.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">{t('subscriptionPlans.status')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-sm text-gray-500">{t('subscriptionPlans.isActive')}:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPlan.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPlan.isActive ? t('subscriptionPlans.active') : t('subscriptionPlans.inactive')}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-sm text-gray-500">{t('subscriptionPlans.isPopular')}:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPlan.isPopular 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPlan.isPopular ? t('subscriptionPlans.popular') : t('subscriptionPlans.notPopular')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">{t('subscriptionPlans.timestamps')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-gray-500">{t('subscriptionPlans.createdAt')}:</span>
                      <span className="font-medium">{new Date(selectedPlan.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-gray-500">{t('subscriptionPlans.updatedAt')}:</span>
                      <span className="font-medium">{new Date(selectedPlan.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
