import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import ProductTreeView from './ProductTreeView';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import PermissionModal from '../../components/common/PermissionModal';
import { CustomTable } from '../../components/common/CustomTable';
import * as XLSX from 'xlsx';
import { initialSubcategories } from '../subcategories/subcategories';
import useProducts from '../../hooks/useProducts';
import useProductLabel from '../../hooks/useProductLabel';
import useCategories from '../../hooks/useCategories';
import useUnits from '../../hooks/useUnits';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';
import TableImage from '../../components/common/TableImage';
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
  storeId: string;
  visibility: string;
  unit: string;
  unitId: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  originalPrice: string;

  tags: string[];
  productOrder: string;
  maintainStock: string;
  availableQuantity: number;
  
  descriptionAr: string;
  descriptionEn: string;
  barcodes: string[];
  newBarcode: string;
  productSpecifications: string[];
  selectedSpecifications: string;
  colors: ColorVariant[];
  images: string[];
  productVideo: string;
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

  tags: [],
  productOrder: '',
  maintainStock: 'Y',
  availableQuantity: 0,
  
  descriptionAr: '',
  descriptionEn: '',
  barcodes: [],
  newBarcode: '',
  productSpecifications: [],
  selectedSpecifications: '',
  colors: [],
  images: [],
  productVideo: '',
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');

  // استخدام الهوك الجديد
  const {
    products,
   
    fetchProducts,
    saveProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductImages,
    validateProduct
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

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchProducts();
    fetchProductLabels();
    fetchCategories();
    fetchUnits();
    fetchSpecifications();
  }, [fetchProducts, fetchProductLabels, fetchCategories, fetchUnits, fetchSpecifications]);

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
  // اجمع كل الـ _id للمتغيرات من جميع المنتجات
  const allVariantIds = Array.isArray(products)
    ? products.reduce((acc: string[], product: any) => {
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          acc.push(...product.variants.map((v: any) => (typeof v === 'object' ? v._id || v.id : v)));
        }
        return acc;
      }, [])
    : [];

  let filteredProducts = Array.isArray(products)
    ? products.filter(product => {
        // استبعد المنتجات التي هي متغيرات (أي الـ _id الخاص بها موجود في allVariantIds)
        const productId = product._id || product.id;
        const isVariant = allVariantIds.includes(productId);
        // فلترة حسب البحث والفئة
        const matchesCategory = selectedCategoryId ? product.category?._id === selectedCategoryId : true;
        const matchesSearch = isRTL
          ? product.nameAr.toLowerCase().includes(search.toLowerCase())
          : product.nameEn.toLowerCase().includes(search.toLowerCase());
        return !isVariant && matchesCategory && matchesSearch;
      })
    : [];
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
    console.log(`🔍 tableData - Product ${index + 1} barcodes:`, product.barcodes);
    console.log(`🔍 tableData - Product ${index + 1} barcodes type:`, typeof product.barcodes);
    console.log(`🔍 tableData - Product ${index + 1} barcodes is array:`, Array.isArray(product.barcodes));
    
    return {
      id: product._id || product.id,
      image: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : DEFAULT_PRODUCT_IMAGE),
      nameAr: product.nameAr,
      nameEn: product.nameEn,
    category: product.category ? (isRTL ? product.category.nameAr : product.category.nameEn) : '',
    price: product.price,
      costPrice: product.costPrice,
      compareAtPrice: product.compareAtPrice,
      originalPrice: product.originalPrice,
      unit: product.unit ? (isRTL ? product.unit.nameAr : product.unit.nameEn) : '',
      availableQuantity: product.availableQuantity || product.stock || 0,
      hasVariants: product.hasVariants,
      maintainStock: (product.availableQuantity || product.stock || 0) > 0 ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No'),
      visibility: product.visibility ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden'),
      tags: product.productLabels && product.productLabels.length > 0 
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
        : (isRTL ? 'لا يوجد تصنيف' : 'No Labels'),
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
          barcodes: Array.isArray(product.barcodes) ? product.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [],
      specifications: (() => {
        // أولاً نتحقق من قيم المواصفات المختارة (الحقل الجديد)
        if (product.specificationValues && Array.isArray(product.specificationValues) && product.specificationValues.length > 0) {
          return product.specificationValues.map((spec: any) => {
            if (typeof spec === 'object' && spec.value && spec.title) {
              return `${spec.title}: ${spec.value}`;
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
    images: product.mainImage ? 1 : (product.images?.length || 0),
    colors: product.colors?.length || 0,
    originalProduct: product,
    };
  }) : [];
  //-------------------------------------------- renderImage -------------------------------------------
  const renderImage = (value: any, item: any) => {
    return (
      <TableImage
        src={value}
        alt={isRTL ? item.nameAr : item.nameEn}
        size="md"
      />
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
    if (!value || value === (isRTL ? 'لا يوجد تصنيف' : 'No Labels')) {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا يوجد تصنيف' : 'No Labels'}
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
  //-------------------------------------------- renderBarcode -------------------------------------------
  const renderBarcode = (value: any, item: any) => {
    console.log('🔍 renderBarcode - value:', value);
    console.log('🔍 renderBarcode - value type:', typeof value);
    console.log('🔍 renderBarcode - value is array:', Array.isArray(value));
    
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
            <div key={index} className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
              {barcode}
            </div>
          ))}
        </div>
      );
    }
    
    // إذا كان الباركود قيمة واحدة
    return (
      <div className="text-sm">
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
          {value}
        </span>
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
    // Use originalProduct data which contains the raw API data
    const originalProduct = product.originalProduct || product;
    
    // Handle colors from original product data
    const productColors = originalProduct.colors || [];
    const formColors = Array.isArray(productColors) && productColors.length > 0
      ? productColors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    
    const maintainStock = (originalProduct.availableQuantity || originalProduct.stock || 0) > 0 ? 'Y' : 'N';
    let unitId = originalProduct.unit?._id || originalProduct.unitId;
    let categoryId = originalProduct.category?._id || originalProduct.categoryId;
    let subcategoryId = originalProduct.subcategory?._id || originalProduct.subcategoryId;
    let storeId = originalProduct.store?._id || originalProduct.storeId;
    
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
      nameAr: originalProduct.nameAr || '',
      nameEn: originalProduct.nameEn || '',
      descriptionAr: originalProduct.descriptionAr || '',
      descriptionEn: originalProduct.descriptionEn || '',
      maintainStock,
      unitId: unitId ? String(unitId) : '',
      categoryId: categoryId ? String(categoryId) : '',
      subcategoryId: subcategoryId ? String(subcategoryId) : '',
      storeId: storeId ? String(storeId) : '',
      tags: productLabelIds, // Use the extracted productLabel IDs
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
      // إفراغ الأسعار للمتغير الجديد
      price: '',
      // إفراغ الكمية المتاحة
      availableQuantity: 0,
      // إفراغ المخزون
      stock: 0,
    };
    
    console.log('🔍 handleAddVariant - Creating variant form:', newForm);
    console.log('🔍 handleAddVariant - Parent product ID:', originalProduct._id);
    
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
        className="text-blue-600 hover:text-blue-900 p-1"
        title={isRTL ? 'تعديل المنتج' : 'Edit Product'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => handleAddVariant(item)}
        className="text-green-600 hover:text-green-900 p-1"
        title={isRTL ? 'إضافة متغير' : 'Add Variant'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        onClick={() => handleDelete(item)}
        className="text-red-600 hover:text-red-900 p-1"
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

  //-------------------------------------------- columns -------------------------------------------
  const columns = [
    { key: 'id', label: { ar: 'الرقم', en: 'ID' }, type: 'number' as const },
    { key: 'image', label: { ar: 'الصورة', en: 'Image' }, type: 'image' as const, render: renderImage },
    { key: isRTL ? 'nameAr' : 'nameEn', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' as const },
    { key: isRTL ? 'descriptionAr' : 'descriptionEn', label: { ar: 'الوصف', en: 'Description' }, type: 'text' as const },
    { key: 'category', label: { ar: 'الفئة', en: 'Category' }, type: 'text' as const },
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number' as const, render: renderPrice },
    { key: 'costPrice', label: { ar: 'سعر التكلفة', en: 'Cost Price' }, type: 'number' as const },
    { key: 'compareAtPrice', label: { ar: 'سعر الجملة', en: 'Wholesale Price' }, type: 'number' as const },
    { key: 'unit', label: { ar: 'الوحدة', en: 'Unit' }, type: 'text' as const },
    { key: 'availableQuantity', label: { ar: 'الكمية المتوفرة', en: 'Available Quantity' }, type: 'number' as const, render: renderStock },
    { key: 'maintainStock', label: { ar: 'إدارة المخزون', en: 'Stock Management' }, type: 'text' as const },
    { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'status' as const, render: renderVisibility },
    { key: 'tags', label: { ar: 'التصنيف', en: 'Label' }, type: 'text' as const, render: renderProductLabels },
    { key: 'specifications', label: { ar: 'المواصفات', en: 'Specifications' }, type: 'text' as const, render: renderSpecifications },
    { key: 'barcodes', label: { ar: 'الباركود', en: 'Barcode' }, type: 'text' as const, render: renderBarcode },
    { key: 'variantStatus', label: { ar: 'النوع', en: 'Type' }, type: 'text' as const, render: renderVariantStatus },
    { key: 'images', label: { ar: 'عدد الصور', en: 'Images Count' }, type: 'number' as const },
    { key: 'colors', label: { ar: 'عدد الألوان', en: 'Colors Count' }, type: 'number' as const },
    { key: 'actions', label: { ar: 'العمليات', en: 'Actions' }, type: 'text' as const, render: renderActions, showControls: false },
  ];
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
      console.log('🔍 handleFormChange - Updated barcodes:', newForm.barcodes);
      setForm(newForm);
    } else {
      // التعامل مع الحقول الأخرى
      const newForm = { ...form, [e.target.name]: e.target.value };
      setForm(newForm);
    }
  };

  //-------------------------------------------- handleProductLabelsChange -------------------------------------------
  const handleTagsChange = (values: string[]) => {
    console.log('🔍 handleTagsChange:', values);
    const newForm = { ...form, tags: values };
    console.log('🔍 handleTagsChange - newForm.barcodes:', newForm.barcodes);
    setForm(newForm);
  };
  //-------------------------------------------- handleImageChange -------------------------------------------
  const handleImageChange = async (files: File | File[] | null) => {
    console.log('🔍 handleImageChange:', files);
    if (!files) {
      const newForm = { ...form, images: [] };
      console.log('🔍 handleImageChange (no files) - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
      return;
    }

    try {
      const fileArray = Array.isArray(files) ? files : [files];
      
      // رفع الصور إلى Cloudflare
      const uploadedUrls = await uploadProductImages(fileArray);
      
      // تحديث النموذج بالروابط الجديدة
      const newForm = { ...form, images: uploadedUrls };
      console.log('🔍 handleImageChange - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
      
      console.log('✅ Images uploaded to Cloudflare:', uploadedUrls);
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      // في حالة الخطأ، نستخدم الروابط المحلية كـ fallback
      const fileArray = Array.isArray(files) ? files : [files];
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      const newForm = { ...form, images: imageUrls };
      console.log('🔍 handleImageChange (fallback) - newForm.barcodes:', newForm.barcodes);
      setForm(newForm);
    }
  };
  //-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 handleSubmit - form data:', form);
    console.log('🔍 handleSubmit - form.barcodes:', form.barcodes);
    console.log('🔍 handleSubmit - form.barcodes type:', typeof form.barcodes);
    console.log('🔍 handleSubmit - form.barcodes is array:', Array.isArray(form.barcodes));
    
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
        productOrder: parseInt(String(form.productOrder)) || 0,
        visibility: form.visibility === 'Y',
        unitId: form.unitId || form.unit || null,
        categoryId: form.categoryId || null,
        subcategoryId: form.subcategoryId || null,
        tags: form.tags || [],
        barcodes: Array.isArray(form.barcodes) ? form.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [], // إضافة الباركود مع فلترة القيم الفارغة
        selectedSpecifications: form.selectedSpecifications || '', // إرسال المواصفات المختارة
        colors: Array.isArray(form.colors)
          ? form.colors.map((variant: any) => Array.isArray(variant.colors) ? variant.colors : [])
          : [],
        images: form.images || [],
        isActive: true,
      };

      console.log('🔍 handleSubmit - productData:', productData);
      console.log('🔍 handleSubmit - productData.barcodes:', productData.barcodes);
      console.log('🔍 handleSubmit - productData.barcodes type:', typeof productData.barcodes);
      console.log('🔍 handleSubmit - productData.barcodes is array:', Array.isArray(productData.barcodes));
      console.log('🔍 handleSubmit - productData.barcodes length:', Array.isArray(productData.barcodes) ? productData.barcodes.length : 'N/A');

      // Debug: طباعة معلومات editProduct
      console.log('🔍 handleSubmit - editProduct:', editProduct);
      console.log('🔍 handleSubmit - editProduct._id:', editProduct?._id);
      console.log('🔍 handleSubmit - editProduct.id:', editProduct?.id);
      console.log('🔍 handleSubmit - editId for validation:', editProduct?._id || editProduct?.id);
      
      // التحقق من صحة البيانات
      const errors = validateProduct(productData, isRTL, editProduct?._id || editProduct?.id);
      if (Object.keys(errors).length > 0) {
        console.error('Validation errors:', errors);
        return;
      }

      // حفظ المنتج
      const editId = editProduct?._id || editProduct?.id;
      console.log('🔍 handleSubmit - editId:', editId);
      console.log('🔍 handleSubmit - drawerMode:', drawerMode);
      
      if (drawerMode === 'variant') {
        // إنشاء متغير جديد
        console.log('🔍 handleSubmit - Creating variant for parent product:', editProduct);
        await saveProduct(productData, null, isRTL); // إنشاء منتج جديد كمتغير
      } else {
        // تعديل أو إنشاء منتج عادي
        await saveProduct(productData, editId, isRTL);
      }
      
      setShowDrawer(false);
      setEditProduct(null);
      setDrawerMode('add');
      console.log('🔍 handleSubmit - Resetting form to initialForm');
      console.log('🔍 handleSubmit - Setting form with initialForm.barcodes:', initialForm.barcodes);
      setForm(initialForm);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };
  //-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (product: any) => {
    // Use originalProduct data which contains the raw API data
    const originalProduct = product.originalProduct || product;
    
    // Handle colors from original product data
    const productColors = originalProduct.colors || [];
    const formColors = Array.isArray(productColors) && productColors.length > 0
      ? productColors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    
    const maintainStock = (originalProduct.availableQuantity || originalProduct.stock || 0) > 0 ? 'Y' : 'N';
    let unitId = originalProduct.unit?._id || originalProduct.unitId;
    let categoryId = originalProduct.category?._id || originalProduct.categoryId;
    let subcategoryId = originalProduct.subcategory?._id || originalProduct.subcategoryId;
    let storeId = originalProduct.store?._id || originalProduct.storeId;
    
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
    
    // استخدام قيم المواصفات المختارة إذا كانت موجودة
    console.log('🔍 handleEdit - specificationValues:', specificationValues);
    console.log('🔍 handleEdit - specifications:', specifications);
    console.log('🔍 handleEdit - loaded specifications from hook:', specifications);
    console.log('🔍 handleEdit - originalProduct.barcodes:', originalProduct.barcodes);
    console.log('🔍 handleEdit - originalProduct.barcodes type:', typeof originalProduct.barcodes);
    console.log('🔍 handleEdit - originalProduct.barcodes is array:', Array.isArray(originalProduct.barcodes));
    
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
    
    console.log('🔍 handleEdit - Final selectedSpecifications:', selectedSpecifications);
    
    const newForm = {
      ...originalProduct,
      colors: formColors,
      nameAr: originalProduct.nameAr || '',
      nameEn: originalProduct.nameEn || '',
      descriptionAr: originalProduct.descriptionAr || '',
      descriptionEn: originalProduct.descriptionEn || '',
      maintainStock,
      unitId: unitId ? String(unitId) : '',
      categoryId: categoryId ? String(categoryId) : '',
      subcategoryId: subcategoryId ? String(subcategoryId) : '',
      storeId: storeId ? String(storeId) : '',
      tags: productLabelIds, // Use the extracted productLabel IDs
      selectedSpecifications: JSON.stringify(selectedSpecifications), // Use the extracted specifications in JSON format
      images: originalProduct.images || [], // إضافة الصور
      mainImage: originalProduct.mainImage || null, // إضافة الصورة الرئيسية
      visibility: originalProduct.visibility ? 'Y' : 'N',
      costPrice: originalProduct.costPrice || '',
      compareAtPrice: originalProduct.compareAtPrice || '',
      barcodes: Array.isArray(originalProduct.barcodes) ? originalProduct.barcodes.filter((barcode: string) => barcode && barcode.trim()) : [],
      newBarcode: '',
    };
    
    console.log('🔍 newForm.barcodes:', newForm.barcodes);
    console.log('🔍 newForm.barcodes type:', typeof newForm.barcodes);
    console.log('🔍 newForm.barcodes is array:', Array.isArray(newForm.barcodes));
    
    console.log('🔍 Edit Form Data:', {
      colors: formColors,
      productLabels: productLabelIds,
      specifications: selectedSpecifications,
      selectedSpecificationsJSON: JSON.stringify(selectedSpecifications),
      images: originalProduct.images,
      mainImage: originalProduct.mainImage,
      barcodes: originalProduct.barcodes,
      barcodesType: typeof originalProduct.barcodes,
      barcodesIsArray: Array.isArray(originalProduct.barcodes),
      barcodesLength: Array.isArray(originalProduct.barcodes) ? originalProduct.barcodes.length : 'N/A'
    });
    
    console.log('🔍 handleEdit - Setting form with newForm.barcodes:', newForm.barcodes);
    setForm(newForm);
    setEditProduct(originalProduct);
    setDrawerMode('edit');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleAddClick -------------------------------------------
  const handleAddClick = () => {
    console.log('🔍 handleAddClick - initialForm.barcodes:', initialForm.barcodes);
    setForm(initialForm);
    setEditProduct(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleDrawerClose -------------------------------------------
  const handleDrawerClose = () => {
    console.log('🔍 handleDrawerClose - Resetting form');
    setShowDrawer(false);
    setEditProduct(null);
    setDrawerMode('add');
    console.log('🔍 handleDrawerClose - Setting form with initialForm.barcodes:', initialForm.barcodes);
    setForm(initialForm);
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
        console.error('Error deleting product:', error);
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
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isRTL ? 'عرض الجدول' : 'Table View'}
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isRTL ? 'عرض الشجرة' : 'Tree View'}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {isRTL ? 'إجمالي المنتجات:' : 'Total Products:'} {visibleTableData.length}
        </div>
      </div>

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
          renderImage={renderImage}
          renderPrice={renderPrice}
          renderStock={renderStock}
          renderVisibility={renderVisibility}
          renderProductLabels={renderProductLabels}
          renderBarcode={renderBarcode}
          renderSpecifications={renderSpecifications}
          renderVariantStatus={renderVariantStatus}
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
        onSubmit={handleSubmit}
        categories={categories as any}
        tags={productLabels}
        units={units}
        specifications={specifications}
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
    </div>
  );
};

export default ProductsPage; 