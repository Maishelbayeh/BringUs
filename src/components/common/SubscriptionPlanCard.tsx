import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

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

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isRTL: boolean;
  actionLoading: string | null;
  onView: (plan: SubscriptionPlan) => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onToggleStatus: (planId: string) => void;
  onTogglePopular: (planId: string, isPopular: boolean) => void;
  getPlanTypeLabel: (type: string) => string;
  getCurrencySymbol: (currency: string) => string;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  isRTL,
  actionLoading,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePopular,
  getPlanTypeLabel,
  getCurrencySymbol
}) => {
  const { t } = useTranslation();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Function to truncate text to specified number of lines
  const truncateText = (text: string, maxLines: number = 3) => {
    const words = text.split(' ');
    const maxWords = maxLines * 8; // Approximate words per line
    if (words.length <= maxWords) {
      return { text, isTruncated: false };
    }
    return {
      text: words.slice(0, maxWords).join(' ') + '...',
      isTruncated: true
    };
  };

  const displayDescription = isRTL ? plan.descriptionAr : plan.description;
  const { text: truncatedDescription, isTruncated } = truncateText(displayDescription, 3);
  const showDescription = isDescriptionExpanded ? displayDescription : truncatedDescription;

  return (
    <div
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
        {/* Plan Name - Single Line */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap" title={isRTL ? plan.nameAr : plan.name}>
            {isRTL ? plan.nameAr : plan.name}
          </h3>
          
          {/* Description with Read More/Less */}
          <div className="text-sm text-gray-600">
            <p className={`${isDescriptionExpanded ? '' : 'line-clamp-3'} leading-relaxed`}>
              {showDescription}
            </p>
            {isTruncated && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-purple-600 hover:text-purple-800 text-xs font-medium mt-1 transition-colors"
              >
                {isDescriptionExpanded ? t('subscriptionPlans.readLess') : t('subscriptionPlans.readMore')}
              </button>
            )}
          </div>
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
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className={`flex justify-between `}>
            <span>{t('subscriptionPlans.planType')}</span>
            <span className="font-medium">{getPlanTypeLabel(plan.type)}</span>
          </div>
          <div className={`flex justify-between `}>
            <span>{t('subscriptionPlans.durationDays')}</span>
            <span className="font-medium">{plan.duration}</span>
          </div>
          <div className={`flex justify-between `}>
            <span>{t('subscriptionPlans.currency')}</span>
            <span className="font-medium">{plan.currency}</span>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 pt-4 border-t border-gray-200">
          <div className={`flex justify-between items-center `}>
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

        {/* Action Buttons - Improved Layout */}
        <div className="pt-4 border-t border-gray-200">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* View Button */}
            <button
              onClick={() => onView(plan)}
              className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[36px]"
            >
              <EyeIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{isRTL ? 'عرض' : 'View'}</span>
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(plan)}
              className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[36px]"
            >
              <PencilIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{t('general.edit')}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(plan)}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[36px]"
            >
              <TrashIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{t('general.delete')}</span>
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Toggle Status Button */}
            <button
              onClick={() => onToggleStatus(plan._id)}
              disabled={actionLoading === plan._id}
              className={`px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[36px] ${
                plan.isActive 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              } ${actionLoading === plan._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {actionLoading === plan._id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : (
                <>
                  {plan.isActive ? <XCircleIcon className="w-3 h-3" /> : <CheckCircleIcon className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {plan.isActive ? t('subscriptionPlans.deactivate') : t('subscriptionPlans.activate')}
                  </span>
                </>
              )}
            </button>

            {/* Toggle Popular Button */}
            <button
              onClick={() => onTogglePopular(plan._id, plan.isPopular)}
              disabled={actionLoading === plan._id}
              className={`px-2 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[36px] ${
                plan.isPopular 
                  ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' 
                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              } ${actionLoading === plan._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {actionLoading === plan._id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : (
                <>
                  <StarIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">
                    {plan.isPopular ? t('subscriptionPlans.removePopular') : t('subscriptionPlans.makePopular')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;

