import React from 'react';
import CustomButton from '../../components/common/CustomButton';
import ProductsForm from './ProductsForm';  
//-------------------------------------------- ColorVariant -------------------------------------------
interface ColorVariant {
  id: string;
  colors: string[];
}
//-------------------------------------------- ProductsDrawerProps -------------------------------------------
interface ProductsDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  drawerMode?: 'add' | 'edit' | 'variant';
  form: {
    nameAr: string;
    nameEn: string;
    categoryId: string;
    storeId: string;
    visibility: string;
    unit: string;
    unitId: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    tags: string[];
    // productOrder: string;
    maintainStock: string;
    availableQuantity: number;
    lowStockThreshold: number;
    descriptionAr: string;
    descriptionEn: string;
    barcodes: string[];
    productSpecifications: string[];
    colors: ColorVariant[];
    images: string[];
    mainImage: string | null;
    videoUrl: string; 
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTagsChange: (values: string[]) => void;
  onImageChange: (files: File | File[] | null) => void;
  onMainImageChange: (file: File | null) => void;
  uploadMainImage?: (file: File) => Promise<string>;
  onSubmit: (e: React.FormEvent) => void;
  categories?: { id: number; nameAr: string; nameEn: string }[];
  tags?: any[];
  units?: any[];
  specifications?: any[];
  // إضافة خصائص التحقق من صحة البيانات
  validationErrors?: { [key: string]: string };
  onFieldValidation?: (fieldName: string, value: any) => void;
  showValidation?: boolean;
  productsFormRef?: any; // أضف هذا السطر
}
const ProductsDrawer: React.FC<ProductsDrawerProps> = ({ open, onClose, isRTL, title, drawerMode = 'add', form, onFormChange, onTagsChange, onImageChange, onMainImageChange, uploadMainImage, onSubmit, categories = [], tags = [], units = [], specifications = [], validationErrors = {}, onFieldValidation, showValidation = true, productsFormRef }) => {
  if (!open) return null;
  
  //-------------------------------------------- return ------------------------------------------- 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-3xl h-[85vh] bg-white shadow-2xl rounded-2xl flex flex-col transition-all duration-300 p-0 ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ------------------------------------------- Header ------------------------------------------- */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-primary">{title}</h2>
            {drawerMode === 'variant' && (
              <p className="text-sm text-gray-600 mt-1">
                {isRTL ? 'إضافة متغير جديد للمنتج' : 'Adding new variant to product'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 bg-gray-100 hover:bg-primary/10 transition text-xl"
            style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* ------------------------------------------- Form ------------------------------------------- */}
        
        <form id="product-form" onSubmit={onSubmit} className="flex-1 " onClick={(e) => e.stopPropagation()}>
          <div className="h-full overflow-y-auto">
            {(() => {
              console.log('🔍 ProductsDrawer - form:', form);
              return null;
            })()}
            <ProductsForm
              ref={productsFormRef}
              form={form}
              onFormChange={onFormChange}
              onTagsChange={onTagsChange}
              onImageChange={onImageChange}
              onMainImageChange={onMainImageChange}
              uploadMainImage={uploadMainImage}
              categories={categories}
              tags={tags}
              units={units}
              specifications={specifications}
              validationErrors={validationErrors}
              onFieldValidation={onFieldValidation}
              showValidation={showValidation}
            />
          </div>
        </form>
        {/* ------------------------------------------- Footer ------------------------------------------- */}
        <div className="flex justify-between gap-3 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl sticky bottom-0">
          <CustomButton
            color="white"
            textColor="primary"
            text={isRTL ? 'إلغاء' : 'Cancel'}
            action={onClose}
            bordercolor="primary"
          />
          <div>
            
          </div>
          <CustomButton
            color="primary"
            textColor="white"
            text={isRTL ? 'حفظ' : 'Save'}
            type="submit"
            form="product-form"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsDrawer;