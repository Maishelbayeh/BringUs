import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';
import axios from 'axios';
import CustomSelect from './dropdown';
import { useToastContext } from '@/contexts/ToastContext';

interface Feature {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  included: boolean;
}

interface SubscriptionPlan {
  _id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'free' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom';
  duration: number;
  price: number;
  currency: string;
  features: Feature[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  maxProducts: number;
  maxOrders: number;
  maxUsers: number;
  storageLimit: number;
}

interface AddSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: SubscriptionPlan;
  isEdit?: boolean;
}

const AddSubscriptionPlanModal: React.FC<AddSubscriptionPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan,
  isEdit = false
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { showError } = useToastContext();  
  const { showSuccess } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionPlan>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    type: 'monthly',
    duration: 30,
    price: 0,
    currency: 'USD',
    features: [],
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    maxProducts: -1,
    maxOrders: -1,
    maxUsers: -1,
    storageLimit: -1
  });

  const [_newFeature, _setNewFeature] = useState<Feature>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    included: true
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && plan) {
      setFormData({
        name: plan.name || '',
        nameAr: plan.nameAr || '',
        description: plan.description || '',
        descriptionAr: plan.descriptionAr || '',
        type: plan.type || 'monthly',
        duration: plan.duration || 30,
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        features: plan.features || [],
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        isPopular: plan.isPopular !== undefined ? plan.isPopular : false,
        sortOrder: plan.sortOrder || 0,
        maxProducts: plan.maxProducts || -1,
        maxOrders: plan.maxOrders || -1,
        maxUsers: plan.maxUsers || -1,
        storageLimit: plan.storageLimit || -1
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        type: 'monthly',
        duration: 30,
        price: 0,
        currency: 'USD',
        features: [],
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        maxProducts: -1,
        maxOrders: -1,
        maxUsers: -1,
        storageLimit: -1
      });
    }
  }, [isEdit, plan]);

  const planTypes = [
    { value: 'free', label: 'Free', labelAr: 'مجاني' },
    { value: 'monthly', label: 'Monthly', labelAr: 'شهري' },
    { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي' },
    { value: 'semi_annual', label: 'Semi Annual', labelAr: 'نصف سنوي' },
    { value: 'annual', label: 'Annual', labelAr: 'سنوي' },
    { value: 'custom', label: 'Custom', labelAr: 'مخصص' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', nameAr: 'دولار أمريكي' },
    { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', nameAr: 'شيكل إسرائيلي' },
    { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar', nameAr: 'دينار أردني' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  // const addFeature = () => {
  //   if (newFeature.name && newFeature.nameAr) {
  //     setFormData(prev => ({
  //       ...prev,
  //       features: [...prev.features, { ...newFeature }]
  //     }));
  //     setNewFeature({
  //       name: '',
  //       nameAr: '',
  //       description: '',
  //       descriptionAr: '',
  //       included: true
  //     });
  //   }
  // };

  // const removeFeature = (index: number) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     features: prev.features.filter((_, i) => i !== index)
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (isEdit && plan) {
        // Update existing plan
        response = await axios.put(`https://bringus-backend.onrender.com/api/subscription-plans/${plan._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Subscription plan updated:', response.data);
        showSuccess(t('subscriptionPlans.planUpdated'));
      } else {
        // Create new plan
        response = await axios.post('https://bringus-backend.onrender.com/api/subscription-plans', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Subscription plan created:', response.data);
        showSuccess(t('subscriptionPlans.planCreated'));
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} subscription plan:`, error);
       showError(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'creating'} subscription plan`);
    } finally {
      setIsLoading(false);
    }
  };

  // Common input styling classes with purple theme
  const inputClasses = `
    w-full px-4 py-3.5 border border-gray-300 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
    transition-all duration-200 ease-in-out
    bg-white text-gray-900 placeholder-gray-500
    ${isRTL ? 'text-right' : 'text-left'}
    hover:border-purple-400 shadow-sm
  `;

  const labelClasses = `
    block text-sm font-semibold text-gray-700 mb-3
    ${isRTL ? 'text-right' : 'text-left'}
  `;

  const textareaClasses = `
    w-full px-4 py-3.5 border border-gray-300 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
    transition-all duration-200 ease-in-out
    bg-white text-gray-900 placeholder-gray-500 resize-none
    ${isRTL ? 'text-right' : 'text-left'}
    hover:border-purple-400 shadow-sm
  `;

  const checkboxClasses = `
    w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded-lg
    focus:ring-purple-500 focus:ring-2
    ${isRTL ? 'ml-3' : 'mr-3'}
  `;

  const sectionClasses = `
    bg-gray-50 rounded-xl p-6 border border-gray-200
  `;

  const sectionHeaderClasses = `
    text-lg font-bold text-gray-900 mb-6 flex items-center gap-2
    ${isRTL ? 'text-right' : 'text-left'}
  `;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-8 py-6 bg-gradient-to-r from-gray-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {isEdit ? t('subscriptionPlans.editPlan') : t('subscriptionPlans.addNewPlan')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-3xl transition-colors duration-200 p-2 hover:bg-red-50 rounded-xl"
            type="button"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className={sectionClasses}>
              <h3 className={sectionHeaderClasses}>
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('subscriptionPlans.basicInfo')}
              </h3>
              
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.name')} (English)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter plan name in English"
                    className={inputClasses}
                  />
                </div>

                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.name')} (العربية)
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اسم الخطة بالعربية"
                    className={inputClasses}
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.description')} (English)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter plan description in English"
                    className={textareaClasses}
                  />
                </div>

                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.description')} (العربية)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="أدخل وصف الخطة بالعربية"
                    className={textareaClasses}
                  />
                </div>

                {/* Plan Type */}
                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.type')}
                  </label>
                  <CustomSelect
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    options={planTypes.map(type => ({
                      value: type.value,
                      label: isRTL ? type.labelAr : type.label
                    }))}
                    isRTL={isRTL}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className={labelClasses}>
                    {t('subscriptionPlans.duration')} (days)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter duration in days"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Settings */}
            <div className="space-y-6">
              {/* Pricing Section */}
              <div className={sectionClasses}>
                <h3 className={sectionHeaderClasses}>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {t('subscriptionPlans.pricingAndLimits')}
                </h3>
                
                <div className="space-y-6">
                  {/* Price */}
                  <div className="space-y-3">
                    <label className={labelClasses}>
                      {t('subscriptionPlans.price')}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={inputClasses}
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-3">
                    <label className={labelClasses}>
                      {t('subscriptionPlans.currency')}
                    </label>
                    <CustomSelect
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      options={currencies.map(currency => ({
                        value: currency.code,
                        label: `${currency.symbol} - ${isRTL ? currency.nameAr : currency.name}`
                      }))}
                      isRTL={isRTL}
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-3">
                    <label className={labelClasses}>
                      {t('subscriptionPlans.sortOrder')}
                    </label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Enter sort order"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className={sectionClasses}>
                <h3 className={sectionHeaderClasses}>
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer hover:bg-white p-3 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className={checkboxClasses}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-700">{t('subscriptionPlans.isActive')}</span>
                      <p className="text-xs text-gray-500 mt-1">Enable or disable this subscription plan</p>
                    </div>
                  </label>

                  <label className="flex items-center cursor-pointer hover:bg-white p-3 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleInputChange}
                      className={checkboxClasses}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-700">{t('subscriptionPlans.isPopular')}</span>
                      <p className="text-xs text-gray-500 mt-1">Mark this plan as popular to highlight it</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
        

        </form>
        
        {/* Footer */}
        <div className="flex justify-between gap-4 px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-white text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold border border-gray-300 shadow-sm"
          >
            {t('general.cancel')}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('general.saving')}
              </div>
            ) : (
              isEdit ? t('subscriptionPlans.updatePlan') : t('subscriptionPlans.createPlan')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionPlanModal;
