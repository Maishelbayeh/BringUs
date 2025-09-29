import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import ProductTreeView from './ProductTreeView';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import PermissionModal from '../../components/common/PermissionModal';
import { CustomTable } from '../../components/common/CustomTable';
import VariantManager from './VariantManager';
import * as XLSX from 'xlsx';
import { initialSubcategories } from '../subcategories/subcategories';
import useProducts from '../../hooks/useProducts';
import useProductLabel from '../../hooks/useProductLabel';
import useCategories from '../../hooks/useCategories';
import useUnits from '../../hooks/useUnits';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';
import TableImage from '../../components/common/TableImage';
import useToast from '../../hooks/useToast';
import CustomBarcode from '../../components/common/CustomBarcode';

import { validateProductWithDuplicates } from '../../validation/productValidation';
//-------------------------------------------- ColorVariant -------------------------------------------
interface ColorVariant {
  id: string;
  colors: string[];
}
//-------------------------------------------- initialForm -------------------------------------------
const initialForm: {
  nameAr: string;
  nameEn: string;
  categoryId: string;
  subcategoryId: string;
  categoryIds: string[];
  storeId: string;
  visibility: string;
  unit: string;
  unitId: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  originalPrice: string;

  tags: string[];
  productLabels: string[];
  productOrder: string;
  maintainStock: string;
  availableQuantity: number;
  lowStockThreshold: number;
  totalSpecificationQuantities: number;
  descriptionAr: string;
  descriptionEn: string;
  barcodes: string[];
  newBarcode: string;
  productSpecifications: string[];
  selectedSpecifications: string;
  specifications: string[];
  specificationValues: any[];
  colors: ColorVariant[];
  images: string[];
  mainImage: string | null;
  videoUrl: string;
  isOnSale: string;
  salePercentage: string;
} = {
  nameAr: '',
  nameEn: '',
  categoryId: '',
  subcategoryId: '',
  storeId: '',
  visibility: 'Y',
  unit: '',
  unitId: '',
  price: '',
  costPrice: '',
  compareAtPrice: '',
  originalPrice: '',
  categoryIds: [],
  tags: [],
  productLabels: [],
  productOrder: '',
  maintainStock: 'Y',
  availableQuantity: 0,
  lowStockThreshold: 10,
  totalSpecificationQuantities: 0,
  descriptionAr: '',
  descriptionEn: '',
  barcodes: [],
  newBarcode: '',
  productSpecifications: [],
  selectedSpecifications: '',
  specifications: [],
  specificationValues: [],
  colors: [],
  images: [],
  mainImage: null,
  videoUrl: '',
  isOnSale: 'false',
  salePercentage: '',
};
//-------------------------------------------- ProductsPage -------------------------------------------
const ProductsPage: React.FC = () => {
  const [subcategories] = useState(initialSubcategories);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | 'variant'>('add');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search] = useState('');
  const [sort] = useState('default');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [showVariantsPopup, setShowVariantsPopup] = useState(false);
  const [selectedProductVariants, setSelectedProductVariants] = useState<any[]>([]);
  const [selectedProductInfo, setSelectedProductInfo] = useState<any | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');

  const productsFormRef = useRef<any>(null); // أضف هذا السطر في بداية الكومبوننت

  // استخدام الهوك الجديد
  const {
    products,
   
    fetchProducts,
    saveProduct,
    deleteProduct,
    
    uploadProductImages,
    uploadMainImage,
    addVariant,
    deleteVariant,
    updateVariant,
    fetchProductVariants,
  } = useProducts();

  const {
    productLabels,
    fetchProductLabels,
    loading: loadingLabels
  } = useProductLabel();

  const {
    categories,
    fetchCategories
  } = useCategories();

  const {
    units,
    fetchUnits
  } = useUnits();

  const {
    specifications,
    fetchSpecifications
  } = useProductSpecifications();

  const { showError } = useToast();

  // نظام التحقق من صحة البيانات للمنتجات
  const [productValidationErrors, setProductValidationErrors] = useState<{ [key: string]: string }>({});

  // دالة للتحقق من صحة المنتج مع التحقق من التكرار
  const validateProductForm = useCallback((formData: any) => {
    const result = validateProductWithDuplicates(
      { ...formData, id: editProduct?._id || editProduct?.id },
      products,
      t
    );
    setProductValidationErrors(result.errors);
    return result;
  }, [products, editProduct, t]);

  // دالة للتحقق من صحة حقل واحد
  const handleFieldValidation = useCallback((fieldName: string, value: any) => {
    // مسح الخطأ الحالي للحقل
    setProductValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    // إجراء التحقق الكامل للنموذج إذا كان الحقل مهماً
    if (['nameAr', 'nameEn', 'price', 'categoryId', 'unitId'].includes(fieldName)) {
      // تأخير التحقق قليلاً لتجنب التحقق المستمر أثناء الكتابة
      setTimeout(() => {
        validateProductForm({ ...form, [fieldName]: value });
      }, 500);
    }
  }, [form, validateProductForm]);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchProducts();
    fetchProductLabels();
    fetchCategories();
    fetchUnits();
    fetchSpecifications();
  }, []);
  // دالة لتحديث البيانات
  const refreshData = useCallback(() => {
    fetchProducts(true); // force refresh
    fetchProductLabels();
    fetchCategories();
    fetchUnits();
    fetchSpecifications(true); // force refresh
  }, [fetchProducts, fetchProductLabels, fetchCategories, fetchUnits, fetchSpecifications]);

  //-------------------------------------------- sortOptions -------------------------------------------
  const sortOptions = [
    { value: 'default', label: t('products.sort.default') || 'Default' },
    { value: 'alpha', label: t('products.sort.alpha') || 'A-Z' },
    { value: 'newest', label: t('products.sort.newest') || 'Newest' },
    { value: 'oldest', label: t('products.sort.oldest') || 'Oldest' },
  ];
  //-------------------------------------------- useEffect -------------------------------------------
  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subcategoryIdParam) setSelectedSubcategoryId(subcategoryIdParam);
  }, [categoryIdParam, subcategoryIdParam]);
  //-------------------------------------------- filteredProducts -------------------------------------------
  // فلترة المنتجات لعرض المنتجات الأساسية فقط (غير المتغيرات)
  let filteredProducts = Array.isArray(products)
    ? products.filter(product => {
        const productId = product._id || product.id;
        
        // تحقق من أن هذا المنتج ليس متغير لأي منتج آخر
        const isVariantOfAnotherProduct = products.some(otherProduct => {
          if (otherProduct._id === productId) return false; // نفس المنتج
          if (Array.isArray(otherProduct.variants)) {
            return otherProduct.variants.some((variant: any) => {
              const variantId = typeof variant === 'object' ? variant._id || variant.id : variant;
              return variantId === productId;
            });
          }
          return false;
        });
        
        // فلترة حسب البحث والفئة
        const matchesCategory = selectedCategoryId ? product.category?._id === selectedCategoryId : true;
        const matchesSearch = isRTL
          ? product.nameAr.toLowerCase().includes(search.toLowerCase())
          : product.nameEn.toLowerCase().includes(search.toLowerCase());
        
        // عرض المنتج فقط إذا لم يكن متغير
        const shouldShow = !isVariantOfAnotherProduct && matchesCategory && matchesSearch;
        
        // تحقق إضافي: تأكد من أن المنتج ليس متغير
        // المنتج يعتبر متغير إذا كان موجود في قائمة variants لأي منتج آخر
        
        // تحقق إضافي: إذا كان المنتج لديه isParent: false، فهو متغير
        // لكن المنتجات العادية (بدون متغيرات) لديها أيضاً isParent: false
        // لذا نتحقق من أن المنتج ليس متغير لأي منتج آخر
        const isVariantByParentFlag = product.isParent === false && isVariantOfAnotherProduct;
        
        // تحقق إضافي: المنتج يعتبر متغير إذا كان موجود في قائمة variants لأي منتج آخر
        // أو إذا كان isParent: false وليس منتج عادي (hasVariants: false)
        const isDefinitelyVariant = isVariantOfAnotherProduct || (product.isParent === false && product.hasVariants !== false);
        
        // Log for debugging
        if (isVariantOfAnotherProduct) {
          console.log(`🔍 Filtered out variant: ${product.nameEn} (${productId}) - found in variants list`);
        }
        if (isDefinitelyVariant) {
          console.log(`🔍 Filtered out variant: ${product.nameEn} (${productId}) - isParent: ${product.isParent}, hasVariants: ${product.hasVariants}`);
        }
        
        return shouldShow && !isDefinitelyVariant;
      })
    : [];
  
  // Log filtered results
  console.log(`🔍 Total products: ${products?.length || 0}`);
  console.log(`🔍 Filtered products: ${filteredProducts.length}`);
  console.log(`🔍 Filtered product names:`, filteredProducts.map(p => p.nameEn));
  console.log(`🔍 Products with variants:`, products?.filter(p => p.hasVariants).map(p => p.nameEn));
  console.log(`🔍 Variant products:`, products?.filter(p => p.isParent === false).map(p => p.nameEn));
  if (sort === 'alpha') {
    filteredProducts = [...filteredProducts].sort((a, b) => (isRTL ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn)));
  } else if (sort === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'oldest') {
    filteredProducts = [...filteredProducts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  //-------------------------------------------- getCategoryName -------------------------------------------    
  const getCategoryName = (catId: number) => {
    const cat = categories.find((c: any) => c.id === catId || c._id === catId);
    return isRTL ? (cat?.nameAr || '') : (cat?.nameEn || '');
  };
  //-------------------------------------------- getSubcategoryName -------------------------------------------
  const getSubcategoryName = (subId: number) => {
    const sub = subcategories.find(s => s.id === subId);
    return isRTL ? (sub?.nameAr || '') : (sub?.nameEn || '');
  };

  //-------------------------------------------- getUnitName -------------------------------------------
  const getUnitName = (unitId: number) => {
    const unit = units?.find((u: any) => u.id === unitId || u._id === unitId);
    return isRTL ? (unit?.nameAr || '') : (unit?.nameEn || '');
  };
  //-------------------------------------------- tableData -------------------------------------------
  const tableData = Array.isArray(filteredProducts) ? filteredProducts.map((product, index) => {
    // Log barcodes for debugging
    //CONSOLE.log(`🔍 tableData - Product ${index + 1} barcodes:`, product.barcodes);
    //CONSOLE.log(`🔍 tableData - Product ${index + 1} barcodes type:`, typeof product.barcodes);
    //CONSOLE.log(`🔍 tableData - Product ${index + 1} barcodes is array:`, Array.isArray(product.barcodes));
    
    return {
      id: product._id || product.id,
      mainImage: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : DEFAULT_PRODUCT_IMAGE),
      images: product.images || [],
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      category: product.category ? (isRTL ? product.category.nameAr : product.category.nameEn) : '',
      categories: product.categories || [],
      price: product.price,
      costPrice: product.costPrice,
      compareAtPrice: product.compareAtPrice,
      originalPrice: product.originalPrice,
      unit: product.unit ? (isRTL ? product.unit.nameAr : product.unit.nameEn) : '',
      availableQuantity: product.availableQuantity || product.stock || 0,
      hasVariants: product.hasVariants,
      maintainStock: (product.availableQuantity || product.stock || 0) > 0 ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No'),
      visibility: product.visibility ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden'),
      productLabels: product.productLabels && product.productLabels.length > 0 
        ? product.productLabels.map((label: any) => {
            // Handle both populated objects and IDs
            if (typeof label === 'object' && label.nameAr && label.nameEn) {
              return isRTL ? label.nameAr : label.nameEn;
            } else {
              // If it's just an ID, find the label in the loaded productLabels
              const foundLabel = productLabels.find((l: any) => l._id === label || l.id === label);
              return foundLabel ? (isRTL ? foundLabel.nameAr : foundLabel.nameEn) : label;
            }
          }).join(', ')
        : (isRTL ? 'لا يوجد علامات' : 'No Labels'),
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
          barcodes: Array.isArray(product.barcodes) ? product.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [],
      specifications: (() => {
        // أولاً نتحقق من قيم المواصفات المختارة (الحقل الجديد)
        if (product.specificationValues && Array.isArray(product.specificationValues) && product.specificationValues.length > 0) {
          return product.specificationValues.map((spec: any) => {
            // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
            const specData = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec.specificationId) : null;
            const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : (spec.title || `Specification ${spec.specificationId}`);
            
            if (typeof spec === 'object' && spec.value) {
              return `${title}: ${spec.value}`;
            }
            return spec;
          }).join(', ');
        }
        
        // إذا لم تكن موجودة، نتحقق من المواصفات القديمة
        if (!product.specifications || !Array.isArray(product.specifications) || product.specifications.length === 0) {
          return isRTL ? 'لا توجد مواصفات' : 'No Specifications';
        }
        
        return product.specifications.map((spec: any) => {
          // التنسيق الجديد: { specificationId, valueId, value, title }
          if (typeof spec === 'object' && spec.value && spec.title) {
            return `${spec.title}: ${spec.value}`;
          }
          // التنسيق القديم: populated objects
          else if (typeof spec === 'object' && spec.titleAr && spec.titleEn) {
            return isRTL ? spec.titleAr : spec.titleEn;
          }
          // إذا كانت مجرد ID، نبحث عن المواصفة في البيانات المحملة
          else {
            const specData = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec || s.id === spec) : null;
            return specData ? (isRTL ? specData.titleAr : specData.titleEn) : spec;
          }
        }).join(', ');
      })(),
    colors: product.colors || [],
    originalProduct: product,
    };
  }) : [];
  //-------------------------------------------- renderMainImage -------------------------------------------
  const renderMainImage = (value: any, item: any) => {
    const mainImage = item.mainImage || (item.images && item.images.length > 0 ? item.images[0] : DEFAULT_PRODUCT_IMAGE);
    return (
      <div className="flex justify-center">
        <TableImage
          src={mainImage}
          alt={isRTL ? item.nameAr : item.nameEn}
          size="md"
        />
      </div>
    );
  };

  //-------------------------------------------- renderImages -------------------------------------------
  const renderImages = (value: any, item: any) => {
    const images = item.images || [];
    const mainImage = item.mainImage;
    
    // فلترة الصور الإضافية فقط (بدون الصورة الرئيسية)
    const additionalImages = images.filter((img: string) => 
      img && img !== null && img !== undefined && img !== mainImage
    );
    
    if (additionalImages.length === 0) {
      return (
        <div className="text-center text-gray-500 text-sm">
          {isRTL ? 'لا توجد صور إضافية' : 'No Additional Images'}
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1">
          {additionalImages.slice(0, 6).map((image: string, index: number) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`${isRTL ? 'صورة إضافية' : 'Additional Image'} ${index + 1}`}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => {
                  // يمكن إضافة modal لعرض الصورة بحجم أكبر
                  window.open(image, '_blank');
                }}
                title={isRTL ? 'انقر لعرض الصورة' : 'Click to view image'}
              />
            </div>
          ))}
        </div>
        {additionalImages.length > 6 && (
          <div className="text-center text-xs text-gray-500 mt-1">
            +{additionalImages.length - 6} {isRTL ? 'أخرى' : 'more'}
          </div>
        )}
      </div>
    );
  };

  //-------------------------------------------- renderPrice -------------------------------------------
  const renderPrice = (value: any, item: any) => {
    return (
      <div className="text-sm">
        <div className="font-semibold text-primary">{value}</div>
        {item.originalPrice && item.originalPrice !== value && (
          <div className="text-xs text-gray-500 line-through">{item.originalPrice}</div>
        )}
       
      </div>
    );
  };
  //-------------------------------------------- renderStock -------------------------------------------
  const renderStock = (value: any, item: any) => {
    const quantity = Number(value);
    let colorClass = 'bg-green-100 text-green-700';
    let text = value;
    if (quantity === 0) {
      colorClass = 'bg-red-100 text-red-700';
      text = isRTL ? 'نفذ المخزون' : 'Out of Stock';
    } else if (quantity < 10) {
      colorClass = 'bg-orange-100 text-orange-700';
      text = `${value} (${isRTL ? 'منخفض' : 'Low'})`;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {text}
      </span>
    );
  };
  //-------------------------------------------- renderVisibility -------------------------------------------
  const renderVisibility = (value: any) => {
    const isVisible = value === (isRTL ? 'ظاهر' : 'Visible');
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {value}
      </span>
    );
  };
  //-------------------------------------------- renderProductLabels -------------------------------------------
  const renderProductLabels = (value: any, item: any) => {
    if (!value || value === (isRTL ? 'لا يوجد علامات' : 'No Labels')) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا يوجد علامات' : 'No Labels'}
        </span>
      );
    }
    
    const labels = value.split(', ');
    return (
      <div className="flex flex-wrap gap-1">
        {labels.map((label: string, index: number) => (
          <span 
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
          >
            {label}
          </span>
        ))}
      </div>
    );
  };
  //-------------------------------------------- renderColors -------------------------------------------
  const renderColors = (value: any, item: any) => {
    const colors = item.colors || [];
    
    if (!colors || colors.length === 0) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا توجد ألوان' : 'No Colors'}
        </span>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {colors.map((colorGroup: any, groupIndex: number) => {
          // Handle both array of colors and object with colors property
          const colorArray = Array.isArray(colorGroup) ? colorGroup : 
                           (colorGroup && colorGroup.colors && Array.isArray(colorGroup.colors)) ? colorGroup.colors : 
                           [colorGroup];
          
          // If there's only one color, display as a simple circle
          if (colorArray.length === 1) {
            return (
              <div
                key={`${groupIndex}-0`}
                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: colorArray[0] }}
                title={colorArray[0]}
              />
            );
          }
          
          // If there are multiple colors, create a divided circle
          return (
            <div
              key={`${groupIndex}-divided`}
              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm relative overflow-hidden"
              title={colorArray.join(', ')}
            >
              {colorArray.map((color: string, colorIndex: number) => {
                const angle = (360 / colorArray.length);
                const startAngle = colorIndex * angle;
                const endAngle = (colorIndex + 1) * angle;
                
                // Create SVG path for the pie slice
                const radius = 12; // Half of w-6 (24px)
                const centerX = radius;
                const centerY = radius;
                
                const startRadians = (startAngle - 90) * (Math.PI / 180);
                const endRadians = (endAngle - 90) * (Math.PI / 180);
                
                const x1 = centerX + radius * Math.cos(startRadians);
                const y1 = centerY + radius * Math.sin(startRadians);
                const x2 = centerX + radius * Math.cos(endRadians);
                const y2 = centerY + radius * Math.sin(endRadians);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                return (
                  <svg
                    key={colorIndex}
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d={pathData}
                      fill={color}
                    />
                  </svg>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  //-------------------------------------------- renderCategories -------------------------------------------
  const renderCategories = (value: any, item: any) => {
    const categories = item.categories || [];
    
    if (!categories || categories.length === 0) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا توجد فئات' : 'No Categories'}
        </span>
      );
    }
    
    return (
      <div className="text-sm space-y-1">
        {categories.map((category: any, index: number) => (
          <div key={index} className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 font-medium">
            {isRTL ? category.nameAr : category.nameEn}
          </div>
        ))}
      </div>
    );
  };

  //-------------------------------------------- renderBarcode -------------------------------------------
  const renderBarcode = (value: any, item: any) => {
    //CONSOLE.log('🔍 renderBarcode - value:', value);
    //CONSOLE.log('🔍 renderBarcode - value type:', typeof value);
    //CONSOLE.log('🔍 renderBarcode - value is array:', Array.isArray(value));
    
    if (!value || value.length === 0) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا يوجد باركود' : 'No Barcode'}
        </span>
      );
    }
    
    // إذا كان الباركود مصفوفة، نعرض كل واحد في سطر منفصل
    if (Array.isArray(value)) {
      return (
        <div className="text-sm space-y-1">
          {value.map((barcode: string, index: number) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative group">
                <CustomBarcode 
                  value={barcode} 
                  width={1.5} 
                  height={40} 
                  fontSize={8}
                  margin={2}
                  displayValue={false}
                  showPrintButton={true}
                  isRTL={isRTL}
                  className="mb-1"
                />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-center">
                  {barcode}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // إذا كان الباركود قيمة واحدة
    return (
      <div className="text-sm flex flex-col items-center">
        <div className="relative group">
          <CustomBarcode 
            value={value} 
            width={1.5} 
            height={40} 
            fontSize={8}
            margin={2}
            displayValue={false}
            showPrintButton={true}
            isRTL={isRTL}
            className="mb-1"
          />
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-center">
            {value}
          </span>
        </div>
      </div>
    );
  };

  //-------------------------------------------- renderSpecifications -------------------------------------------
  const renderSpecifications = (value: any, item: any) => {
    if (!value || value === (isRTL ? 'لا توجد مواصفات' : 'No Specifications')) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا توجد مواصفات' : 'No Specifications'}
        </span>
      );
    }
    
    const specs = value.split(', ');
    return (
      <div className="flex flex-wrap gap-1">
        {specs.map((spec: string, index: number) => (
          <span 
            key={index}
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
          >
            {spec}
          </span>
        ))}
      </div>
    );
  };
  //-------------------------------------------- handleAddVariant -------------------------------------------
  const handleAddVariant = (product: any) => {
    const originalProduct = product.originalProduct || product;
    // تطبيع unit/category/tags
    const unitId = originalProduct.unit?._id || originalProduct.unitId || (typeof originalProduct.unit === 'string' ? originalProduct.unit : '');
    const categoryId = originalProduct.category?._id || originalProduct.categoryId || (typeof originalProduct.category === 'string' ? originalProduct.category : '');
    const subcategoryId = originalProduct.subcategory?._id || originalProduct.subcategoryId || (typeof originalProduct.subcategory === 'string' ? originalProduct.subcategory : '');
    const storeId = originalProduct.store?._id || originalProduct.storeId || (typeof originalProduct.store === 'string' ? originalProduct.store : '');
    const tags = (originalProduct.productLabels || []).map((l: any) => typeof l === 'object' ? String(l._id || l.id) : String(l));
    // تعريف formColors
    
    const productColors = originalProduct.colors || [];
    const formColors = Array.isArray(productColors) && productColors.length > 0
      ? productColors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    
    const maintainStock = (originalProduct.availableQuantity || originalProduct.stock || 0) > 0 ? 'Y' : 'N';
    
    // Extract productLabels and convert to array of IDs
    const productLabels = originalProduct.productLabels || [];
    const productLabelIds = Array.isArray(productLabels) && productLabels.length > 0
      ? productLabels.map((label: any) => {
          // Handle both populated objects and IDs
          if (typeof label === 'object' && label._id) {
            return label._id;
          } else {
            return label; // Already an ID
          }
        })
      : [];

    // Extract specifications and convert to the format expected by the form
    const specifications = originalProduct.specifications || [];
    const specificationValues = originalProduct.specificationValues || [];
    
    const selectedSpecifications = Array.isArray(specificationValues) && specificationValues.length > 0
      ? specificationValues.map((spec: any) => {
          // ابحث عن المواصفة في المواصفات المحملة
          const foundSpec = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec.specificationId) : null;
          let valueText = spec.value;
          let valueIndex = -1;
          if (foundSpec && Array.isArray(foundSpec.values)) {
            valueIndex = foundSpec.values.findIndex((v: any) =>
              v.valueAr === spec.value || v.valueEn === spec.value
            );
            if (valueIndex !== -1) {
              valueText = isRTL ? foundSpec.values[valueIndex].valueAr : foundSpec.values[valueIndex].valueEn;
            }
          }
          return {
            _id: valueIndex !== -1 ? `${spec.specificationId}_${valueIndex}` : spec.valueId,
            value: valueText,
            title: isRTL && foundSpec ? foundSpec.titleAr : foundSpec ? foundSpec.titleEn : spec.title
          };
        })
      : Array.isArray(specifications) && specifications.length > 0
        ? specifications.map((spec: any) => {
            // التنسيق الجديد: { specificationId, valueId, value, title }
            if (typeof spec === 'object' && spec.value && spec.title) {
              return {
                _id: spec.valueId || `${spec.specificationId}_${Date.now()}`,
                value: spec.value,
                title: spec.title
              };
            }
            // التنسيق القديم: populated objects
            else if (typeof spec === 'object' && spec.titleAr && spec.titleEn) {
              return {
                _id: spec._id || spec.id,
                value: isRTL ? spec.titleAr : spec.titleEn,
                title: isRTL ? spec.titleAr : spec.titleEn
              };
            }
            // إذا كانت مجرد ID
            else {
              const specData = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec || s.id === spec) : null;
              return {
                _id: spec,
                value: specData ? (isRTL ? specData.titleAr : specData.titleEn) : spec,
                title: specData ? (isRTL ? specData.titleAr : specData.titleEn) : spec
              };
            }
          })
        : [];
    
    // إنشاء نموذج جديد للمتغير مع نسخ معلومات المنتج الأصلي وإفراغ الأسعار والباركود والصور
    const newForm = {
      ...originalProduct,
      colors: formColors,
   
      maintainStock,
      unit: String(unitId),
      unitId: String(unitId),
      categoryId: String(categoryId),
      categoryIds: originalProduct.categoryIds || originalProduct.categories?.map((cat: any) => cat._id || cat.id) || [String(categoryId)],
      subcategoryId: String(subcategoryId),
      storeId: String(storeId),
      tags: tags,
      productLabels: productLabelIds, 
      selectedSpecifications: JSON.stringify(selectedSpecifications), // Use the extracted specifications in JSON format
      // إفراغ الصور للمتغير الجديد
      images: [],
      mainImage: null,
      visibility: originalProduct.visibility ? 'Y' : 'N',
      costPrice: originalProduct.costPrice || '',
      compareAtPrice: originalProduct.compareAtPrice || '',
      // إفراغ الباركود للمتغير الجديد
      barcodes: [],
      newBarcode: '',
      nameAr: '',
      nameEn:  '',
      descriptionAr:  '',
      descriptionEn: '',
      // إفراغ الأسعار للمتغير الجديد
      price: '',
      // إفراغ الكمية المتاحة
      availableQuantity: 0,
      // إفراغ المخزون
      stock: 0,
      videoUrl: '',
    };
    delete newForm._id; // Ensure no _id for new variant
    // تعيين المنتج الأصلي كـ parent product للمتغير
    setEditProduct(originalProduct);
    setDrawerMode('variant'); // وضع جديد للمتغيرات
    setForm(newForm);
    setShowDrawer(true);
  };

  //-------------------------------------------- renderActions -------------------------------------------
  const renderActions = (value: any, item: any) => (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => handleEdit(item)}
        className="text-blue-600 hover:text-blue-900 p-1.5"
        title={isRTL ? 'تعديل المنتج' : 'Edit Product'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => handleAddVariant(item)}
        className="text-green-600 hover:text-green-900 p-1.5"
        title={isRTL ? 'إضافة متغير' : 'Add Variant'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        onClick={() => handleDelete(item)}
        className="text-red-600 hover:text-red-900 p-1.5"
        title={isRTL ? 'حذف المنتج' : 'Delete Product'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
  //-------------------------------------------- renderVariantStatus -------------------------------------------
  const renderVariantStatus = (value: any, item: any) => {
    const hasVariants = item.hasVariants;
    
    if (hasVariants) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {isRTL ? 'أصلي' : 'Parent'}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {isRTL ? 'عادي' : 'Regular'}
        </span>
      );
    }
  };

  //-------------------------------------------- handleShowVariants -------------------------------------------
  const handleShowVariants = async (item: any) => {
    // جلب بيانات المنتج الأصلية
    const product = item.originalProduct || item;
    setSelectedProductInfo(product);

    // Fetch variants from API
    if (product && product._id && product.store && product.store._id) {
      const variants = await fetchProductVariants(product._id, product.store._id);
      setSelectedProductVariants(variants);
    } else {
      setSelectedProductVariants([]);
    }
    setShowVariantsPopup(true);
  };

  // Note: handleEditVariant is not used - variant editing is handled in VariantManager.tsx

  //-------------------------------------------- handleDeleteVariant -------------------------------------------
  const handleDeleteVariant = async (variant: any) => {
    try {
      if (!selectedProductInfo) {
        console.error('❌ No parent product selected');
        return;
      }

      const confirmed = window.confirm(
        isRTL 
          ? `هل أنت متأكد من حذف المتغير "${variant.nameAr || variant.nameEn}"؟`
          : `Are you sure you want to delete the variant "${variant.nameAr || variant.nameEn}"?`
      );

      if (!confirmed) return;

      console.log('🔍 handleDeleteVariant - Deleting variant:', variant._id, 'from product:', selectedProductInfo._id);
      
      await deleteVariant(selectedProductInfo._id, variant._id);
      
      // Update the variants list
      setSelectedProductVariants(prev => prev.filter(v => v._id !== variant._id));
      
      // Show success message
    } catch (error) {
      console.error('🔍 handleDeleteVariant - Error:', error);
    }

  };

  //-------------------------------------------- renderProductId -------------------------------------------
  const renderProductId = (value: any, item: any) => (
    <button
      className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
      onClick={() => handleShowVariants(item)}
      title={isRTL ? 'عرض متغيرات المنتج' : 'Show Product Variants'}
    >
     {isRTL ? 'عرض متغيرات المنتج' : 'Show Product Variants'}
    </button>
  );

  //-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (product: any) => {
    const originalProduct = product.originalProduct || product;
    
    console.log('🔍 handleEdit - originalProduct:', originalProduct);
    console.log('🔍 handleEdit - originalProduct.categoryIds:', originalProduct.categoryIds);
    console.log('🔍 handleEdit - originalProduct.categories:', originalProduct.categories);
    console.log('🔍 handleEdit - originalProduct.category:', originalProduct.category);
    
    // Handle colors from original product data - pass raw colors data to let ProductsForm handle conversion
    const productColors = originalProduct.colors || [];
    console.log('🔍 handleEdit - originalProduct.colors:', originalProduct.colors);
    console.log('🔍 handleEdit - productColors type:', typeof productColors);
    console.log('🔍 handleEdit - productColors is array:', Array.isArray(productColors));
    
    const maintainStock = (originalProduct.availableQuantity || originalProduct.stock || 0) > 0 ? 'Y' : 'N';
    const unitId = originalProduct.unit?._id || originalProduct.unitId || (typeof originalProduct.unit === 'string' ? originalProduct.unit : '');
    const categoryId = originalProduct.category?._id || originalProduct.categoryId || (typeof originalProduct.category === 'string' ? originalProduct.category : '');
    const subcategoryId = originalProduct.subcategory?._id || originalProduct.subcategoryId || (typeof originalProduct.subcategory === 'string' ? originalProduct.subcategory : '');
    const storeId = originalProduct.store?._id || originalProduct.storeId || (typeof originalProduct.store === 'string' ? originalProduct.store : '');
    const tags = (originalProduct.productLabels || []).map((l: any) => typeof l === 'object' ? String(l._id || l.id) : String(l));
    console.log('🔍 handleEdit - originalProduct.productLabels:', originalProduct.productLabels);
    console.log('🔍 handleEdit - processed tags:', tags);

    // Extract specifications and convert to the format expected by the form
    const specifications = originalProduct.specifications || [];
    const specificationValues = originalProduct.specificationValues || [];
    
    // استخدام قيم المواصفات المختارة إذا كانت موجودة
    const selectedSpecifications = Array.isArray(specificationValues) && specificationValues.length > 0
      ? specificationValues.map((spec: any) => {
          const foundSpec = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec.specificationId) : null;
          let valueText = spec.value;
          let valueIndex = -1;
          if (foundSpec && Array.isArray(foundSpec.values)) {
            valueIndex = foundSpec.values.findIndex((v: any) =>
              v.valueAr === spec.value || v.valueEn === spec.value
            );
            if (valueIndex !== -1) {
              valueText = isRTL ? foundSpec.values[valueIndex].valueAr : foundSpec.values[valueIndex].valueEn;
            }
          }
          return {
            _id: valueIndex !== -1 ? `${spec.specificationId}_${valueIndex}` : spec.valueId,
            value: valueText,
            title: isRTL && foundSpec ? foundSpec.titleAr : foundSpec ? foundSpec.titleEn : spec.title
          };
        })
      : Array.isArray(specifications) && specifications.length > 0
        ? specifications.map((spec: any) => {
            if (typeof spec === 'object' && spec.value && spec.title) {
              return {
                _id: spec.valueId || `${spec.specificationId}_${Date.now()}`,
                value: spec.value,
                title: spec.title
              };
            } else if (typeof spec === 'object' && spec.titleAr && spec.titleEn) {
              return {
                _id: spec._id || spec.id,
                value: isRTL ? spec.titleAr : spec.titleEn,
                title: isRTL ? spec.titleAr : spec.titleEn
              };
            } else {
              const specData = Array.isArray(specifications) ? specifications.find((s: any) => s._id === spec || s.id === spec) : null;
              return {
                _id: spec,
                value: specData ? (isRTL ? specData.titleAr : specData.titleEn) : spec,
                title: specData ? (isRTL ? specData.titleAr : specData.titleEn) : spec
              };
            }
          })
        : [];
    
    // Always include all fields from initialForm, and ensure arrays/strings are correct
    const newForm = {
      ...initialForm,
      ...originalProduct,
      colors: productColors, // Pass raw colors data to let ProductsForm handle conversion
      nameAr: originalProduct.nameAr || '',
      nameEn: originalProduct.nameEn || '',
      descriptionAr: originalProduct.descriptionAr || '',
      descriptionEn: originalProduct.descriptionEn || '',
      maintainStock,
      unitId: String(unitId),
      unit: String(unitId),
      categoryId: String(categoryId),
      categoryIds: originalProduct.categoryIds || originalProduct.categories?.map((cat: any) => cat._id || cat.id) || [String(categoryId)],
      subcategoryId: String(subcategoryId),
      storeId: String(storeId),
      tags: tags,
      productLabels: originalProduct.productLabels || [], 
      selectedSpecifications: typeof selectedSpecifications === 'string' ? selectedSpecifications : JSON.stringify(selectedSpecifications),
      images: Array.isArray(originalProduct.images) ? originalProduct.images : [],
      mainImage: originalProduct.mainImage || null,
      visibility: originalProduct.visibility ? 'Y' : 'N',
      costPrice: originalProduct.costPrice || '',
      compareAtPrice: originalProduct.compareAtPrice || '',
      barcodes: Array.isArray(originalProduct.barcodes) ? originalProduct.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [],
      newBarcode: '',
      videoUrl: originalProduct.videoUrl || '',
    };
    
   
    setForm(newForm);
    setEditProduct(originalProduct);
    setDrawerMode('edit');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (product: any) => {
    const originalProduct = product.originalProduct || product;
    setSelectedProduct(originalProduct);
    setShowDeleteModal(true);
  };
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        const productId = selectedProduct._id || selectedProduct.id;
        await deleteProduct(productId);
        setSelectedProduct(null);
      } catch (error) {
        //CONSOLE.error('Error deleting product:', error);
      }
    }
    setShowDeleteModal(false);
  };
  //-------------------------------------------- handleDownloadExcel -------------------------------------------
  const handleDownloadExcel = () => {
    const rows: any[] = [];
    visibleTableData.forEach((product) => {
      rows.push({
        [isRTL ? 'اسم المنتج' : 'Product Name']: isRTL ? product.nameAr : product.nameEn,
        [isRTL ? 'الفئة' : 'Category']: product.category,
        [isRTL ? 'السعر' : 'Price']: product.price,
        [isRTL ? 'سعر التكلفة' : 'Cost Price']: product.costPrice,
        [isRTL ? 'سعر الجملة' : 'Wholesale Price']: product.compareAtPrice,
        [isRTL ? 'الوحدة' : 'Unit']: product.unit,
        [isRTL ? 'الباركود' : 'Barcode']: Array.isArray(product.barcodes) ? product.barcodes.join(', ') : product.barcodes,
        [isRTL ? 'الكمية المتوفرة' : 'Available Quantity']: product.availableQuantity,
        [isRTL ? 'الظهور' : 'Visibility']: product.visibility,
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products.xlsx');
  };
  //-------------------------------------------- handleAddClick -------------------------------------------
  const handleAddClick = () => {
    setForm({
      ...initialForm,
      unit: '',
      unitId: '',
      categoryId: '',
      categoryIds: [],
      tags: [],
    });
    setEditProduct(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleDrawerClose -------------------------------------------
  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditProduct(null);
    setDrawerMode('add');
    setForm(initialForm); // Reset form to initial state
  };
  //-------------------------------------------- handleFormChange -------------------------------------------
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    console.log('🔍 handleFormChange:', { name: e.target.name, value: e.target.value });
    
    if (e.target.name === 'maintainStock') {
      if (e.target.value === 'N') {
        const newForm = { ...form, maintainStock: 'N', availableQuantity: 0 };
        setForm(newForm);
      } else {
        const newForm = { ...form, maintainStock: 'Y' };
        setForm(newForm);
      }
    } else if (e.target.name === 'availableQuantity') {
      const val = e.target.value;
      const numVal = val === '' ? 0 : Number(val);
      if (!numVal || numVal <= 0) {
        const newForm = { ...form, availableQuantity: numVal, maintainStock: 'N' };
        setForm(newForm);
      } else {
        const newForm = { ...form, availableQuantity: numVal, maintainStock: 'Y' };
        setForm(newForm);
      }
    } else if (e.target.name === 'barcodes') {
      // التعامل مع الباركود كمصفوفة
      let barcodesValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        barcodesValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          barcodesValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كنص واحد
          barcodesValue = [e.target.value];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const barcodesArray = Array.isArray(barcodesValue) ? barcodesValue : [barcodesValue];
      
      const newForm = { ...form, barcodes: barcodesArray };
      //CONSOLE.log('🔍 handleFormChange - Updated barcodes:', newForm.barcodes);
      setForm(newForm);
    } else if (e.target.name === 'mainImage') {
      // التعامل مع الصورة الأساسية
      //CONSOLE.log('🔍 handleFormChange - Updating mainImage:', e.target.value);
      //CONSOLE.log('🔍 handleFormChange - mainImage type:', typeof e.target.value);
      //CONSOLE.log('🔍 handleFormChange - mainImage === null:', e.target.value === null);
      //CONSOLE.log('🔍 handleFormChange - mainImage === undefined:', e.target.value === undefined);
      //CONSOLE.log('🔍 handleFormChange - mainImage === empty string:', e.target.value === '');
      const newForm = { ...form, mainImage: e.target.value };
      //CONSOLE.log('🔍 handleFormChange - Updated mainImage:', newForm.mainImage);
      //CONSOLE.log('🔍 handleFormChange - Updated mainImage type:', typeof newForm.mainImage);
      setForm(newForm);
    } else if (e.target.name === 'unitId') {
      // تحديث unitId و unit معاً
      const newForm = { ...form, unitId: e.target.value, unit: e.target.value };
      setForm(newForm);
    } else if (e.target.name === 'unit') {
      // تحديث unit و unitId معاً
      const newForm = { ...form, unit: e.target.value, unitId: e.target.value };
      setForm(newForm);
    } else if (e.target.name === 'colors') {
      // التعامل مع الألوان كمصفوفة
      console.log('🔍 handleFormChange - colors received:', e.target.value);
      console.log('🔍 handleFormChange - colors type:', typeof e.target.value);
      console.log('🔍 handleFormChange - colors is array:', Array.isArray(e.target.value));
      
      let colorsValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        colorsValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          colorsValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          colorsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const colorsArray = Array.isArray(colorsValue) ? colorsValue : [];
      
      const newForm = { ...form, colors: colorsArray };
 
      setForm(newForm);
    } else if (e.target.name === 'productLabels') {
      // التعامل مع productLabels كمصفوفة
     
      let productLabelsValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        productLabelsValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          productLabelsValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          productLabelsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const productLabelsArray = Array.isArray(productLabelsValue) ? productLabelsValue : [];
      
      const newForm = { ...form, productLabels: productLabelsArray };
 
      setForm(newForm);
    } else if (e.target.name === 'specifications') {
     
      let specificationsValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        specificationsValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          specificationsValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          specificationsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const specificationsArray = Array.isArray(specificationsValue) ? specificationsValue : [];
      
      const newForm = { ...form, specifications: specificationsArray };
    
      setForm(newForm);
    } else if (e.target.name === 'specificationValues') {
      // التعامل مع specificationValues كمصفوفة
    
      let specificationValuesValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        specificationValuesValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          specificationValuesValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          specificationValuesValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const specificationValuesArray = Array.isArray(specificationValuesValue) ? specificationValuesValue : [];
      
      const newForm = { ...form, specificationValues: specificationValuesArray };

      setForm(newForm);
    } else if (e.target.name === 'categoryIds') {
   
      let categoryIdsValue: any = e.target.value;
      
      // إذا كانت القيمة مصفوفة، استخدمها كما هي
      if (Array.isArray(e.target.value)) {
        categoryIdsValue = e.target.value;
      } else if (typeof e.target.value === 'string') {
        // إذا كانت القيمة نص، حاول تحليلها كـ JSON
        try {
          categoryIdsValue = JSON.parse(e.target.value);
        } catch {
          // إذا فشل التحليل، استخدمها كمصفوفة فارغة
          categoryIdsValue = [];
        }
      }
      
      // تأكد من أن القيمة مصفوفة
      const categoryIdsArray = Array.isArray(categoryIdsValue) ? categoryIdsValue : [];
      
      const newForm = { ...form, categoryIds: categoryIdsArray };

      setForm(newForm);
    } else {
     
      const newForm = { ...form, [e.target.name]: e.target.value };

      setForm(newForm);
    }
  };

  //-------------------------------------------- handleProductLabelsChange -------------------------------------------
  const handleTagsChange = (values: string[]) => {

    const newForm = { ...form, productLabels : values };

    setForm(newForm);
  };
  //-------------------------------------------- handleImageChange -------------------------------------------
  const handleImageChange = async (files: File | File[] | null) => {
    //CONSOLE.log('🔍 handleImageChange:', files);
    if (!files) {
      const newForm = { ...form, images: [] };
      //CONSOLE.log('🔍 handleImageChange (no files) - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
      return;
    }

    try {
      const fileArray = Array.isArray(files) ? files : [files];
      
      // رفع الصور إلى Cloudflare
      const uploadedUrls = await uploadProductImages(fileArray);
      
      // تحديث النموذج بالروابط الجديدة
      const newForm = { ...form, images: uploadedUrls };
      //CONSOLE.log('🔍 handleImageChange - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
      
      //CONSOLE.log('✅ Images uploaded to Cloudflare:', uploadedUrls);
    } catch (error) {
      //CONSOLE.error('❌ Error uploading images:', error);
      // في حالة الخطأ، نستخدم الروابط المحلية كـ fallback
      const fileArray = Array.isArray(files) ? files : [files];
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      const newForm = { ...form, images: imageUrls };
      //CONSOLE.log('🔍 handleImageChange (fallback) - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
    }
  };

  //-------------------------------------------- handleMainImageChange -------------------------------------------
  const handleMainImageChange = async (file: File | null) => {

    if (!file) {
      console.log("no files");
      const newForm = { ...form, mainImage: null };
   
      setForm(newForm);
      return;
    }

    try {
   
      // رفع الصورة الرئيسية إلى Cloudflare
      const uploadedUrl = await uploadMainImage(file);
    
      
      // تحديث النموذج بالرابط الجديد
      const newForm = { ...form, mainImage: uploadedUrl };
     
      setForm(newForm);
      
      
    } catch (error) {
   
      // في حالة الخطأ، نستخدم الرابط المحلي كـ fallback
      const imageUrl = URL.createObjectURL(file);
      const newForm = { ...form, mainImage: imageUrl };
    
      setForm(newForm);
    }
  };
  //-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    // جلب الباركود من ProductsForm مباشرة (حتى لو لم يضغط +)
    if (productsFormRef.current && typeof productsFormRef.current.getCurrentBarcode === 'function') {
      const currentBarcode = productsFormRef.current.getCurrentBarcode();
      if (currentBarcode && currentBarcode.trim() && !form.barcodes.includes(currentBarcode.trim())) {
        form.barcodes = [...form.barcodes, currentBarcode.trim()];
        setForm({ ...form });
      }
    }

    try {
     
      // تحويل البيانات إلى الشكل المطلوب للـ API
      const productData = {
        nameAr: form.nameAr || '',
        nameEn: form.nameEn || '',
        descriptionAr: form.descriptionAr || '',
        descriptionEn: form.descriptionEn || '',
        storeId: form.storeId || '',
        price: parseFloat(form.price) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        compareAtPrice: parseFloat(form.compareAtPrice) || 0,
        originalPrice: parseFloat(form.originalPrice) || 0,
        availableQuantity: parseInt(String(form.availableQuantity)) || 0,
        stock: parseInt(String(form.totalSpecificationQuantities)) || 0,

        productOrder: parseInt(String(form.productOrder)) || 0,
        visibility: form.visibility === 'Y',
        unitId: form.unitId || form.unit || null,
        categoryId: form.categoryId || null,
        categoryIds: form.categoryIds || [],  
        //productLabels: form.productLabels || [],
        subcategoryId: form.subcategoryId || null,
        productLabels: (() => {
        
          // Use tags if available, otherwise use productLabels
            const labels =  form.productLabels || [];
        
          return labels;
        })(),
        barcodes: Array.isArray(form.barcodes) ? form.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [], // إضافة الباركود مع فلترة القيم الفارغة
        selectedSpecifications: form.selectedSpecifications || '', // إرسال المواصفات المختارة
        specifications: Array.isArray(form.specifications) ? form.specifications : [], // إرسال IDs المواصفات
        specificationValues: Array.isArray(form.specificationValues) ? form.specificationValues : [], // إرسال قيم المواصفات مع الكمية والسعر
        colors: (() => {
          
          if (Array.isArray(form.colors)) {
            const processedColors = form.colors.map((variant: any) => {
             
              // إذا كان variant مصفوفة ألوان مباشرة (من convertedColors)
              if (Array.isArray(variant)) {
              
                return variant;
              }
              // إذا كان variant يحتوي على colors property (من CustomColorPicker)
              else if (variant && typeof variant === 'object' && Array.isArray(variant.colors)) {
                
                return variant.colors;
              }
              // إذا كان لون واحد
              else if (typeof variant === 'string') {
                console.log('🔍 handleSubmit - Returning single color as array:', [variant]);
                return [variant];
              }
              // إذا كان null أو undefined
              else {
                console.log('🔍 handleSubmit - Returning empty array for null/undefined variant');
                return [];
              }
            }).filter((colors: string[]) => colors.length > 0); // إزالة المصفوفات الفارغة
            
            console.log('🔍 handleSubmit - Final processed colors:', processedColors);
            return processedColors;
          } else {
            console.log('🔍 handleSubmit - form.colors is not an array, returning empty array');
            return [];
          }
        })(),
        images: form.images || [],
        mainImage: form.mainImage || null,
        isActive: true,
        isOnSale: form.isOnSale === 'true',
        salePercentage: parseFloat(form.salePercentage) || 0,
        videoUrl: form.videoUrl || '',
      };

     
      // التحقق من صحة البيانات باستخدام النظام الجديد
      const validationResult = validateProductForm(productData);
      if (!validationResult.isValid) {
        console.log('❌ Validation errors:', validationResult.errors);
        showError(
          Object.values(validationResult.errors).join(' | ') || 'حدث خطأ في التحقق من البيانات',
          isRTL ? 'خطأ في التحقق' : 'Validation Error'
        );
        return;
      }

      // حفظ المنتج
      const editId = editProduct?._id || editProduct?.id;
    
      if (drawerMode === 'variant') {
        // If the form has no _id, it's a new variant
        const formWithId = form as any;
        if (!formWithId._id) {
          // Add new variant
          await addVariant(editProduct._id, form);
        } else {
          // Update existing variant
          // For variants, editProduct is the variant itself, so we need the parent product ID
          const parentProductId = selectedProductInfo?._id || editProduct.parentProductId || editProduct.parent || editProduct.productId;
          await updateVariant(
            parentProductId,
            formWithId._id,
            form
          );
        }
      } else {
        // تعديل أو إنشاء منتج عادي
       
        await saveProduct(productData, editId);
      }
      
      setShowDrawer(false);
      setEditProduct(null);
      setDrawerMode('add');
      //CONSOLE.log('🔍 handleSubmit - Resetting form to initialForm');
      //CONSOLE.log('🔍 handleSubmit - Setting form with initialForm.barcodes:', initialForm.barcodes);
      setForm(initialForm);
    } catch (error) {
      //CONSOLE.error('Error saving product:', error);
    }
  };
  //-------------------------------------------- columns -------------------------------------------
  const columns = [
    { key: 'actions', label: { ar: 'العمليات', en: 'Actions' }, type: 'text' as const, render: renderActions, showControls: false },
    { key: 'mainImage', label: { ar: 'الصورة الرئيسية', en: 'Main Image' }, type: 'image' as const, render: renderMainImage },
    { key: 'images', label: { ar: 'الصور الإضافية', en: 'Additional Images' }, type: 'text' as const, render: renderImages },
    { key: isRTL ? 'nameAr' : 'nameEn', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' as const },
    { key: isRTL ? 'descriptionAr' : 'descriptionEn', label: { ar: 'الوصف', en: 'Description' }, type: 'text' as const },
    { key: 'categories', label: { ar: 'الفئات', en: 'Categories' }, type: 'text' as const, render: renderCategories },
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number' as const, render: renderPrice },
    { key: 'costPrice', label: { ar: 'سعر التكلفة', en: 'Cost Price' }, type: 'number' as const },
    { key: 'compareAtPrice', label: { ar: 'سعر الجملة', en: 'Wholesale Price' }, type: 'number' as const },
    { key: 'unit', label: { ar: 'الوحدة', en: 'Unit' }, type: 'text' as const },
    { key: 'availableQuantity', label: { ar: 'الكمية المتوفرة', en: 'Available Quantity' }, type: 'number' as const, render: renderStock },
    { key: 'maintainStock', label: { ar: 'إدارة المخزون', en: 'Stock Management' }, type: 'text' as const },
    { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'status' as const, render: renderVisibility },
    { key: 'productLabels', label: { ar: 'علامات المنتج', en: 'Label' }, type: 'text' as const, render: renderProductLabels },
    { key: 'specifications', label: { ar: 'المواصفات', en: 'Specifications' }, type: 'text' as const, render: renderSpecifications },
    { key: 'barcodes', label: { ar: 'الباركود', en: 'Barcode' }, type: 'text' as const, render: renderBarcode },
    { key: 'variantStatus', label: { ar: 'النوع', en: 'Type' }, type: 'text' as const, render: renderVariantStatus },
    { key: 'colors', label: { ar: 'الألوان', en: 'Colors' }, type: 'text' as const, render: renderColors },
    { key: 'id', label: { ar: 'الرقم', en: 'ID' }, type: 'number' as const, render: renderProductId },

  ];
  //-------------------------------------------- return -------------------------------------------   
  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.products') || 'Products', href: '/products' }
      ]} isRtl={isRTL} />
      
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('sideBar.products') || 'Products'}
        addLabel={t('products.add') || 'Add'}
        onAdd={handleAddClick}
        isRtl={isRTL}
        onDownload={handleDownloadExcel}
        count={visibleTableData.length}
      />

      {/* ------------------------------------------- View Mode Toggle ------------------------------------------- */}
    

      {/* ------------------------------------------- Content ------------------------------------------- */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <CustomTable 
            columns={columns} 
            data={tableData} 
            onFilteredDataChange={setVisibleTableData}
            autoScrollToFirst={true}
          />
        </div>
      ) : (
        <ProductTreeView
          products={visibleTableData}
          isRTL={isRTL}
          onEdit={handleEdit}
          onAddVariant={handleAddVariant}
          onDelete={handleDelete}
          renderImage={renderMainImage}
          renderPrice={renderPrice}
          renderStock={renderStock}
          renderVisibility={renderVisibility}
          renderProductLabels={renderProductLabels}
          renderBarcode={renderBarcode}
          renderSpecifications={renderSpecifications}
          renderVariantStatus={renderVariantStatus}
          renderColors={renderColors}
          renderActions={renderActions}
        />
      )}

      {/* ------------------------------------------- ProductsDrawer ------------------------------------------- */}
      <ProductsDrawer
        open={showDrawer}
        onClose={handleDrawerClose}
        isRTL={isRTL}
        title={
          drawerMode === 'edit' 
            ? (isRTL ? 'تعديل المنتج' : 'Edit Product') 
            : drawerMode === 'variant'
              ? (isRTL ? 'إضافة متغير' : 'Add Variant')
              : (isRTL ? 'إضافة منتج جديد' : 'Add New Product')
        }
        drawerMode={drawerMode}
        form={form}
        onFormChange={handleFormChange}
        onTagsChange={handleTagsChange}
        onImageChange={handleImageChange}
        onMainImageChange={handleMainImageChange}
        uploadMainImage={uploadMainImage}
        onSubmit={handleSubmit}
        categories={categories as any}
        tags={productLabels}
        units={units}
        specifications={specifications}
        validationErrors={productValidationErrors}
        onFieldValidation={handleFieldValidation}
        showValidation={true}
        // مرر ref إلى ProductsForm عبر ProductsDrawer
        productsFormRef={productsFormRef}
      />

      {/* ------------------------------------------- PermissionModal ------------------------------------------- */}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('products.deleteConfirmTitle') || 'Confirm Delete Product'}
        message={t('products.deleteConfirmMessage') || 'Are you sure you want to delete this product?'}
        itemName={selectedProduct ? selectedProduct.name : ''}
        itemType={t('products.product') || 'product'}
        isRTL={isRTL}
        severity="danger"
      />

      {/* ------------------------------------------- Variant Manager ------------------------------------------- */}
      <VariantManager
        isOpen={showVariantsPopup}
        onClose={() => setShowVariantsPopup(false)}
        variants={selectedProductVariants}
        parentProduct={selectedProductInfo}
        onDeleteVariant={handleDeleteVariant}
        onUpdateVariant={updateVariant}
        onAddVariant={() => {
          // TODO: Implement add variant functionality
          console.log('🔍 Add variant clicked for product:', selectedProductInfo);
        }}
        isRTL={isRTL}
        categories={categories as any}
        tags={productLabels}
        units={units}
      />
    </div>
  );
};

export default ProductsPage; 