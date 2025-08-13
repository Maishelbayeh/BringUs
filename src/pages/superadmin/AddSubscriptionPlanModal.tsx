import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';
import axios from 'axios';

interface Feature {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  included: boolean;
}

interface SubscriptionPlan {
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
}

const AddSubscriptionPlanModal: React.FC<AddSubscriptionPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  
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

  const [newFeature, setNewFeature] = useState<Feature>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    included: true
  });

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

  const addFeature = () => {
    if (newFeature.name && newFeature.nameAr) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        included: true
      });
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/subscription-plans', formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Subscription plan created:', response.data);
      onSuccess();
      onClose();
      // Reset form
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
    } catch (error: any) {
      console.error('Error creating subscription plan:', error);
      alert(error.response?.data?.message || 'Error creating subscription plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {t('subscriptionPlans.addNewPlan')}
          </span>
          <button
            onClick={onClose}
            className="text-primary hover:text-red-500 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('subscriptionPlans.basicInfo')}
              </h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.name')} (English)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.name')} (العربية)
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.description')} (English)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.description')} (العربية)
                </label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Plan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.type')}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {planTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {isRTL ? type.labelAr : type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.duration')} (days)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pricing & Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('subscriptionPlans.pricingAndLimits')}
              </h3>
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.price')}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.currency')}
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} - {isRTL ? currency.nameAr : currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limits */}
              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subscriptionPlans.maxProducts')}
                  </label>
                  <input
                    type="number"
                    name="maxProducts"
                    value={formData.maxProducts}
                    onChange={handleInputChange}
                    min="-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subscriptionPlans.maxOrders')}
                  </label>
                  <input
                    type="number"
                    name="maxOrders"
                    value={formData.maxOrders}
                    onChange={handleInputChange}
                    min="-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subscriptionPlans.maxUsers')}
                  </label>
                  <input
                    type="number"
                    name="maxUsers"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    min="-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subscriptionPlans.storageLimit')} (GB)
                  </label>
                  <input
                    type="number"
                    name="storageLimit"
                    value={formData.storageLimit}
                    onChange={handleInputChange}
                    min="-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div> */}

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subscriptionPlans.sortOrder')}
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('subscriptionPlans.isActive')}</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('subscriptionPlans.isPopular')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Features Section */}
        

        </form>
        
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('general.cancel')}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('general.saving') : t('subscriptionPlans.createPlan')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionPlanModal;
