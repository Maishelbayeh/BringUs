import React from 'react';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSelect from '../../components/common/CustomSelect';
// New custom components (to be created if not exist)
import CustomSwitch from '../../components/common/CustomSwitch';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';
import CustomShuttle from '../../components/common/CustomShuttle';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import { useTranslation } from 'react-i18next';
import { XIcon } from '@heroicons/react/outline';

interface ColorVariant {
  id: string;
  colors: string[];
}

interface ProductsDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  form: {
    name: string;
    categoryId: string;
    subcategoryId: string;
    visibility: string;
    unit: string;
    price: string;
    originalPrice: string;
    wholesalePrice: string;
    productLabel: string;
    productOrder: string;
    maintainStock: string;
    availableQuantity: string;
    description: string;
    parcode: string;
    productSpecifications: string[];
    colors: ColorVariant[];
    images: string[];
    productVideo: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (files: File | File[] | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
}

const unitOptions = [
  'Bundle', 'Carton', 'Centimeter (cm)', 'Cubic centimeter (cu cm)', 'Cubic foot (cu ft)', 'Cubic inch (cu in)',
  'Cubic meter (cu m)', 'Cubic yard (cu yd)', 'Dozen', 'Fluid ounce (fl oz)', 'Foot (ft)', 'Gallon (gal)', 'Gram (g)',
  'Inch (in)', 'Kilogram (kg)', 'Liter (L)', 'Meter (m)', 'Milliliter (mL)', 'Ounce (oz)', 'Pair', 'Pallet', 'Piece',
  'Pint (pt)', 'Pound (lb)', 'Ream', 'Roll', 'Set', 'Square centimeter (sq cm)', 'Square foot (sq ft)', 'Square inch (sq in)',
  'Square meter (sq m)', 'Square yard (sq yd)', 'Yard (yd)'
].map(u => ({ value: u, label: u }));

const labelOptions = [
  { value: '', label: 'Regular' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Featured', label: 'Featured' },
  { value: 'New', label: 'New' },
];

const specOptions = [
  'spex 1', 'spex2', 'spex3', 'كبير', 'وسط', 'صغير', 'نمرة 30', 'نمره 0-3', 'نمره 3-6', 'نمره من 6-8',
  'نمره 9-12', 'xxl', 'نمرة 40', 'M', 'S'
].map(s => ({ value: s, label: s }));

const ProductsDrawer: React.FC<ProductsDrawerProps> = ({ open, onClose, isRTL, title, form, onFormChange, onImageChange, onSubmit, categories = [], subcategories = [] }) => {
  const { t } = useTranslation();
  if (!open) return null;

  // handle shuttle and color picker changes
  const handleShuttleChange = (e: React.ChangeEvent<{ name: string; value: string[] }>) => {
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };

  const handleColorChange = (e: React.ChangeEvent<{ name: string; value: ColorVariant[] }>) => {
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };

  // Handle custom input changes
  const handleInputChange = (name: string, value: string) => {
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
  };

  // Handle custom select changes
  const handleSelectChange = (name: string, value: string) => {
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <form
        className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-4xl bg-white shadow-2xl p-8 flex flex-col gap-6 transition-transform duration-300 transform overflow-y-auto`}
        style={{ [isRTL ? 'left' : 'right']: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full">
            <CustomInput
              label={isRTL ? 'اسم المنتج' : 'Product Name'}
              name="name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              labelAlign={isRTL ? 'right' : 'left'}
            />
          </div>
          <CustomSelect
            label={isRTL ? 'الفئة' : 'Category'}
            value={form.categoryId}
            onChange={(e) => handleSelectChange('categoryId', e.target.value)}
            options={[{ value: '', label: isRTL ? 'اختر الفئة' : 'Select Category' }, ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))]}
            
          />
          <div style={{ display: form.categoryId ? undefined : 'none' }}>
            <CustomSelect
              label={isRTL ? 'الفئة الفرعية' : 'Subcategory'}
              value={form.subcategoryId}
              onChange={(e) => handleSelectChange('subcategoryId', e.target.value)}
              options={[{ value: '', label: isRTL ? 'اختر الفئة الفرعية (اختياري)' : 'Select Subcategory (optional)' }, ...subcategories.map(sub => ({ value: String(sub.id), label: sub.name }))]}
              
            />
          </div>
          <CustomSwitch
            label={isRTL ? 'مرئي' : 'Visibility'}
            name="visibility"
            checked={form.visibility === 'Y'}
            onChange={onFormChange}
          />
          <CustomSelect
            label={isRTL ? 'الوحدة' : 'Unit'}
            value={form.unit}
            onChange={(e) => handleSelectChange('unit', e.target.value)}
            options={[{ value: '', label: isRTL ? 'اختر وحدة' : 'Select Unit' }, ...unitOptions]}
            
          />
          <CustomInput
            label={isRTL ? 'السعر' : 'Price'}
            name="price"
            value={form.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            type="number"
            required
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <CustomInput
            label={isRTL ? 'السعر الأصلي' : 'Original Price'}
            name="originalPrice"
            value={form.originalPrice}
            onChange={(e) => handleInputChange('originalPrice', e.target.value)}
            type="number"
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <CustomInput
            label={isRTL ? 'سعر الجملة' : 'Wholesale Price'}
            name="wholesalePrice"
            value={form.wholesalePrice}
            onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
            type="number"
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <div className="col-span-full">
            <CustomRadioGroup
              label={isRTL ? 'تصنيف المنتج' : 'Product Label'}
              name="productLabel"
              value={form.productLabel}
              options={labelOptions}
              onChange={onFormChange}
              labelAlign={isRTL ? 'right' : 'left'}
            />
          </div>
          <CustomInput
            label={isRTL ? 'ترتيب المنتج' : 'Product Order'}
            name="productOrder"
            value={form.productOrder}
            onChange={(e) => handleInputChange('productOrder', e.target.value)}
            type="number"
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <CustomSwitch
            label={isRTL ? 'إدارة المخزون' : 'Maintain Stock'}
            name="maintainStock"
            checked={form.maintainStock === 'Y'}
            onChange={onFormChange}
          />
          <CustomInput
            label={isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
            name="availableQuantity"
            value={form.availableQuantity}
            onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
            type="number"
            labelAlign={isRTL ? 'right' : 'left'}
            style={{ display: form.maintainStock === 'Y' ? undefined : 'none' }}
          />
          <div className="col-span-full">
            <CustomInput
              label={isRTL ? 'الوصف' : 'Description'}
              name="description"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              labelAlign={isRTL ? 'right' : 'left'}
            />
          </div>
          <CustomInput
            label={isRTL ? 'الباركود' : 'Parcode'}
            name="parcode"
            value={form.parcode}
            onChange={(e) => handleInputChange('parcode', e.target.value)}
            labelAlign={isRTL ? 'right' : 'left'}
          />
          <div className="col-span-full">
            <CustomShuttle
              label={isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
              name="productSpecifications"
              value={form.productSpecifications || []}
              options={specOptions}
              onChange={handleShuttleChange}
              
            />
          </div>
          <div className="col-span-full">
            <CustomColorPicker
              label={isRTL ? 'الألوان' : 'Colors'}
              name="colors"
              value={form.colors || []}
              onChange={handleColorChange}
              
            />
          </div>
          <div className="col-span-full">
            <CustomFileInput
              label={isRTL ? 'الصور' : 'Pictures'}
              id="images"
              value={form.images}
              onChange={files => onImageChange(files)}
              labelAlign={isRTL ? 'right' : 'left'}
              multiple={true}
            />
          </div>
          <div className="col-span-full">
            <CustomInput
              label={isRTL ? 'رابط فيديو المنتج' : 'Product Video'}
              name="productVideo"
              value={form.productVideo}
              onChange={(e) => handleInputChange('productVideo', e.target.value)}
              labelAlign={isRTL ? 'right' : 'left'}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6 pt-4 border-t">
          <CustomButton 
            color="primary" 
            text={isRTL ? 'حفظ' : 'Save'} 
            type="submit" 
            style={{ flex: 1, padding: '12px' }} 
          />
          <CustomButton 
            color="white" 
            text={isRTL ? 'إلغاء' : 'Cancel'} 
            textColor="primary" 
            onClick={onClose} 
            style={{ flex: 1, padding: '12px' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsDrawer; 