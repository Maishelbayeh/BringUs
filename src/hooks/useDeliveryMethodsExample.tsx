import React, { useState } from 'react';
import useDeliveryMethods from './useDeliveryMethods';
import { DelieveryMethod } from '../Types';

const DeliveryMethodsExample: React.FC = () => {
  const [storeId, setStoreId] = useState<string>('');
  const [formData, setFormData] = useState({
    locationAr: '',
    locationEn: '',
    price: 0,
    whatsappNumber: '',
    estimatedDays: 1,
    descriptionAr: '',
    descriptionEn: '',
  });

  const {
    deliveryMethods,
    loading,
    error,
    createDeliveryMethod,
    fetchDeliveryMethods,
    clearError,
  } = useDeliveryMethods({ storeId });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimatedDays' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      alert('Please enter a Store ID');
      return;
    }

    try {
      const result = await createDeliveryMethod(formData, storeId);
      if (result) {
        alert('Delivery method created successfully!');
        setFormData({
          locationAr: '',
          locationEn: '',
          price: 0,
          whatsappNumber: '',
          estimatedDays: 1,
          descriptionAr: '',
          descriptionEn: '',
        });
      }
    } catch (err) {
      //CONSOLE.error('Error creating delivery method:', err);
    }
  };

  const handleFetchByStore = () => {
    if (storeId) {
      fetchDeliveryMethods({ storeId });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery Methods Example</h1>
      
      {/* Store ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Store ID:</label>
        <input
          type="text"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="Enter Store ID"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleFetchByStore}
          disabled={!storeId || loading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Fetch by Store ID'}
        </button>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Create New Delivery Method</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location (Arabic):</label>
            <input
              type="text"
              name="locationAr"
              value={formData.locationAr}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location (English):</label>
            <input
              type="text"
              name="locationEn"
              value={formData.locationEn}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number:</label>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              required
              placeholder="+970598516067"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Days:</label>
            <input
              type="number"
              name="estimatedDays"
              value={formData.estimatedDays}
              onChange={handleInputChange}
              min="1"
              max="30"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Description (Arabic):</label>
          <textarea
            name="descriptionAr"
            value={formData.descriptionAr}
            onChange={handleInputChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Description (English):</label>
          <textarea
            name="descriptionEn"
            value={formData.descriptionEn}
            onChange={handleInputChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !storeId}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Delivery Method'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={clearError}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Results Display */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Delivery Methods ({deliveryMethods.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryMethods.map((method) => (
              <div key={method._id} className="p-4 border rounded">
                <h3 className="font-semibold">{method.locationEn}</h3>
                <p className="text-gray-600">{method.locationAr}</p>
                <p className="text-green-600 font-medium">${method.price}</p>
                <p className="text-sm text-gray-500">{method.whatsappNumber}</p>
                {method.isDefault && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Default
                  </span>
                )}
                {method.isActive && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded ml-2">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMethodsExample; 