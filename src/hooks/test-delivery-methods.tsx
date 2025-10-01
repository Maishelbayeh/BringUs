import React, { useState} from 'react';
import useDeliveryMethods from './useDeliveryMethods';
import useDeliveryMethodsByStore from './useDeliveryMethodsByStore';

const TestDeliveryMethods: React.FC = () => {
  const [storeId] = useState('687505893fbf3098648bfe16');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [formData, setFormData] = useState({
    locationAr: '',
    locationEn: '',
    price: 0,
    whatsappNumber: '+970598516067',
    estimatedDays: 1,
    descriptionAr: '',
    descriptionEn: '',
  });

  // Admin hook (for creating, updating, deleting)
  const {
    deliveryMethods: adminMethods,
    loading: adminLoading,
    error: adminError,
    createDeliveryMethod,
    updateDeliveryMethod,
    deleteDeliveryMethod,
    toggleActiveStatus,
    setAsDefault,
    clearError: clearAdminError,
  } = useDeliveryMethods({ storeId });

  // Public hook (for fetching by store ID)
  const {
    deliveryMethods: publicMethods,
    loading: publicLoading,
    error: publicError,
    fetchDeliveryMethods: fetchPublicMethods,
    fetchActiveDeliveryMethods,
    fetchDefaultDeliveryMethod,
    clearError: clearPublicError,
  } = useDeliveryMethodsByStore(storeId, { autoFetch: true });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimatedDays' ? Number(value) : value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createDeliveryMethod(formData, storeId);
      if (result) {
        alert('✅ Delivery method created successfully!');
        setFormData({
          locationAr: '',
          locationEn: '',
          price: 0,
          whatsappNumber: '+970598516067',
          estimatedDays: 1,
          descriptionAr: '',
          descriptionEn: '',
        });
      }
    } catch (err) {
      //CONSOLE.error('Error creating delivery method:', err);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const result = await toggleActiveStatus(id);
      if (result) {
        alert('✅ Status toggled successfully!');
      }
    } catch (err) {
      //CONSOLE.error('Error toggling status:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const result = await setAsDefault(id);
      if (result) {
        alert('✅ Set as default successfully!');
      }
    } catch (err) {
      //CONSOLE.error('Error setting default:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery method?')) {
      try {
        const result = await deleteDeliveryMethod(id);
        if (result) {
          alert('✅ Deleted successfully!');
        }
      } catch (err) {
        //CONSOLE.error('Error deleting delivery method:', err);
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (!selectedMethodId) {
      alert('Please select a method to update');
      return;
    }

    try {
      const result = await updateDeliveryMethod(id, formData);
      if (result) {
        alert('✅ Updated successfully!');
        setFormData({
          locationAr: '',
          locationEn: '',
          price: 0,
          whatsappNumber: '+970598516067',
          estimatedDays: 1,
          descriptionAr: '',
          descriptionEn: '',
        });
        setSelectedMethodId('');
      }
    } catch (err) {
      //CONSOLE.error('Error updating delivery method:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Delivery Methods</h1>
      <p className="text-gray-600 mb-6">Store ID: {storeId}</p>

      {/* Error Display */}
      {(adminError || publicError) && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {adminError && (
            <div className="mb-2">
              <strong>Admin Error:</strong> {adminError}
              <button onClick={clearAdminError} className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm">
                Clear
              </button>
            </div>
          )}
          {publicError && (
            <div>
              <strong>Public Error:</strong> {publicError}
              <button onClick={clearPublicError} className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm">
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Update Form */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">
          {selectedMethodId ? 'Update Delivery Method' : 'Create New Delivery Method'}
        </h2>
        
        <form onSubmit={handleCreate} className="space-y-4">
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
                placeholder="الضفة الغربية"
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
                placeholder="West Bank"
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Description (Arabic):</label>
            <textarea
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="توصيل سريع"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description (English):</label>
            <textarea
              name="descriptionEn"
              value={formData.descriptionEn}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Fast delivery"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adminLoading}
              className="px-6 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              {adminLoading ? 'Creating...' : 'Create'}
            </button>
            
            {selectedMethodId && (
              <button
                type="button"
                onClick={() => handleUpdate(selectedMethodId)}
                disabled={adminLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                {adminLoading ? 'Updating...' : 'Update'}
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  locationAr: '',
                  locationEn: '',
                  price: 0,
                  whatsappNumber: '+970598516067',
                  estimatedDays: 1,
                  descriptionAr: '',
                  descriptionEn: '',
                });
                setSelectedMethodId('');
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Admin Methods */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Admin Methods ({adminMethods.length})</h2>
        {adminLoading ? (
          <p>Loading admin methods...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminMethods.map((method) => (
              <div key={method._id} className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold">{method.locationEn}</h3>
                <p className="text-gray-600">{method.locationAr}</p>
                <p className="text-green-600 font-medium">${method.price}</p>
                <p className="text-sm text-gray-500">{method.whatsappNumber}</p>
                <p className="text-sm text-gray-500">{method.estimatedDays} days</p>
                
                <div className="mt-2 space-y-1">
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
                
                                 <div className="mt-3 space-x-2">
                   <button
                     onClick={() => setSelectedMethodId(method._id || '')}
                     className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                   >
                     Edit
                   </button>
                   <button
                     onClick={() => handleToggleActive(method._id || '')}
                     className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                   >
                     Toggle
                   </button>
                   <button
                     onClick={() => handleSetDefault(method._id || '')}
                     className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
                   >
                     Default
                   </button>
                   <button
                     onClick={() => handleDelete(method._id || '')}
                     className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                   >
                     Delete
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Methods */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Public Methods ({publicMethods.length})</h2>
        <div className="mb-4 space-x-2">
          <button
            onClick={() => fetchPublicMethods()}
            disabled={publicLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {publicLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => fetchActiveDeliveryMethods()}
            disabled={publicLoading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Active Only
          </button>
          <button
            onClick={() => fetchDefaultDeliveryMethod()}
            disabled={publicLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300"
          >
            Default Only
          </button>
        </div>
        
        {publicLoading ? (
          <p>Loading public methods...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicMethods.map((method) => (
              <div key={method._id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold">{method.locationEn}</h3>
                <p className="text-gray-600">{method.locationAr}</p>
                <p className="text-green-600 font-medium">${method.price}</p>
                <p className="text-sm text-gray-500">{method.whatsappNumber}</p>
                <p className="text-sm text-gray-500">{method.estimatedDays} days</p>
                
                <div className="mt-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDeliveryMethods; 