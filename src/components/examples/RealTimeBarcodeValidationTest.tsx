import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Test component for real-time barcode validation functionality
 */
const RealTimeBarcodeValidationTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  
  const [localNewBarcode, setLocalNewBarcode] = useState('');
  const [barcodeValidationError, setBarcodeValidationError] = useState<string>('');
  const [existingBarcodes, setExistingBarcodes] = useState<string[]>(['123456', '789012', 'ABC123']);

  // Real-time barcode validation function
  const validateBarcodeRealTime = useCallback((barcode: string) => {
    if (!barcode || barcode.trim() === '') {
      setBarcodeValidationError('');
      return true;
    }

    const trimmedBarcode = barcode.trim();
    
    // Check if barcode contains only letters and numbers
    if (!/^[a-zA-Z0-9]+$/.test(trimmedBarcode)) {
      setBarcodeValidationError(isRTL ? 'الباركود يمكن أن يحتوي على أرقام وحروف فقط' : 'Barcode can only contain letters and numbers');
      return false;
    }

    // Check if barcode already exists in current barcodes
    if (existingBarcodes.includes(trimmedBarcode)) {
      setBarcodeValidationError(isRTL ? 'الباركود موجود مسبقاً' : 'Barcode already exists');
      return false;
    }

    // Check minimum length
    if (trimmedBarcode.length < 3) {
      setBarcodeValidationError(isRTL ? 'الباركود يجب أن يحتوي على 3 أحرف على الأقل' : 'Barcode must be at least 3 characters long');
      return false;
    }

    // Check maximum length
    if (trimmedBarcode.length > 20) {
      setBarcodeValidationError(isRTL ? 'الباركود يجب أن يكون أقل من 20 حرف' : 'Barcode must be less than 20 characters');
      return false;
    }

    // Clear error if validation passes
    setBarcodeValidationError('');
    return true;
  }, [existingBarcodes, isRTL]);

  const handleBarcodeChange = (value: string) => {
    setLocalNewBarcode(value);
    validateBarcodeRealTime(value);
  };

  const addBarcode = () => {
    if (localNewBarcode && localNewBarcode.trim() && !barcodeValidationError) {
      setExistingBarcodes(prev => [...prev, localNewBarcode.trim()]);
      setLocalNewBarcode('');
      setBarcodeValidationError('');
    }
  };

  const removeBarcode = (index: number) => {
    setExistingBarcodes(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'اختبار التحقق من الباركود في الوقت الفعلي' : 'Real-Time Barcode Validation Test'}
      </h2>
      
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            {isRTL ? 'تعليمات الاختبار:' : 'Test Instructions:'}
          </h3>
          <div className="text-sm space-y-1">
            <p>1. {isRTL ? 'اكتب باركود في الحقل أدناه' : 'Type a barcode in the field below'}</p>
            <p>2. {isRTL ? 'لاحظ التحقق في الوقت الفعلي أثناء الكتابة' : 'Notice real-time validation while typing'}</p>
            <p>3. {isRTL ? 'جرب الباركود الموجود مسبقاً: 123456, 789012, ABC123' : 'Try existing barcodes: 123456, 789012, ABC123'}</p>
            <p>4. {isRTL ? 'جرب أحرف غير صالحة مثل: @#$%' : 'Try invalid characters like: @#$%'}</p>
            <p>5. {isRTL ? 'جرب باركود قصير جداً أو طويل جداً' : 'Try very short or very long barcodes'}</p>
          </div>
        </div>

        {/* Barcode Input */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {isRTL ? 'إدخال الباركود:' : 'Barcode Input:'}
          </h3>
          
          <div className="relative">
            <input
              type="text"
              className={`w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                barcodeValidationError 
                  ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder={isRTL ? 'أدخل الباركود هنا...' : 'Enter barcode here...'}
              value={localNewBarcode}
              onChange={(e) => handleBarcodeChange(e.target.value)}
            />
            
            <button
              type="button"
              onClick={addBarcode}
              disabled={!localNewBarcode || !localNewBarcode.trim() || !!barcodeValidationError}
              className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 text-white rounded-full flex items-center justify-center transition-colors ${
                localNewBarcode && localNewBarcode.trim() && !barcodeValidationError
                  ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed'
              } right-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Validation Error Display */}
          {barcodeValidationError && (
            <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {barcodeValidationError}
            </div>
          )}

          {/* Success Message */}
          {localNewBarcode && localNewBarcode.trim() && !barcodeValidationError && (
            <div className="mt-2 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {isRTL ? 'الباركود صالح!' : 'Barcode is valid!'}
            </div>
          )}
        </div>

        {/* Existing Barcodes */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {isRTL ? 'الباركود الموجودة:' : 'Existing Barcodes:'}
          </h3>
          
          {existingBarcodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {existingBarcodes.map((barcode, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-lg border border-purple-200 hover:bg-purple-150 transition-colors"
                >
                  <span className="font-mono mr-2">{barcode}</span>
                  <button
                    type="button"
                    onClick={() => removeBarcode(index)}
                    className="w-5 h-5 bg-purple-200 hover:bg-purple-300 rounded-full flex items-center justify-center transition-colors"
                    title={isRTL ? 'حذف الباركود' : 'Remove barcode'}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {isRTL ? 'لا توجد باركود مضافة' : 'No barcodes added'}
            </p>
          )}
        </div>

        {/* Validation Rules */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'قواعد التحقق:' : 'Validation Rules:'}
          </h3>
          <ul className="text-sm space-y-1">
            <li>• {isRTL ? 'يجب أن يحتوي على أرقام وحروف فقط' : 'Must contain only letters and numbers'}</li>
            <li>• {isRTL ? 'يجب أن يكون بين 3 و 20 حرف' : 'Must be between 3 and 20 characters'}</li>
            <li>• {isRTL ? 'يجب أن يكون فريد (غير مكرر)' : 'Must be unique (not duplicated)'}</li>
            <li>• {isRTL ? 'لا يمكن أن يكون فارغ' : 'Cannot be empty'}</li>
          </ul>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'معلومات التصحيح:' : 'Debug Information:'}
          </h3>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Current Barcode:</span> {localNewBarcode}</p>
            <p><span className="font-medium">Has Error:</span> {barcodeValidationError ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Error Message:</span> {barcodeValidationError || 'None'}</p>
            <p><span className="font-medium">Can Add:</span> {localNewBarcode && localNewBarcode.trim() && !barcodeValidationError ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Existing Count:</span> {existingBarcodes.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeBarcodeValidationTest;

