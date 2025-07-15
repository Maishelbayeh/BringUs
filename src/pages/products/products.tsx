import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
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
  barcode: string;
  productSpecifications: string[];
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
  barcode: '',
  productSpecifications: [],
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
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search] = useState('');
  const [sort] = useState('default');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);
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
  let filteredProducts = Array.isArray(products) ? products.filter(product =>
    (selectedCategoryId ? product.category?._id === selectedCategoryId : true) &&    (isRTL ? product.nameAr.toLowerCase().includes(search.toLowerCase()) : product.nameEn.toLowerCase().includes(search.toLowerCase()))
  ) : [];
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
  const tableData = Array.isArray(filteredProducts) ? filteredProducts.map(product => {

    return {
    id: product._id || product.id,
    image: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : null),
      nameAr: product.nameAr,
      nameEn: product.nameEn,
    category: product.category ? (isRTL ? product.category.nameAr : product.category.nameEn) : '',
    price: product.price,
      costPrice: product.costPrice,
      compareAtPrice: product.compareAtPrice,
    originalPrice: product.originalPrice,
    unit: product.unit ? (isRTL ? product.unit.nameAr : product.unit.nameEn) : '',
    availableQuantity: product.availableQuantity || product.stock || 0,
    maintainStock: (product.availableQuantity || product.stock || 0) > 0 ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No'),
    visibility: product.visibility ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden'),
      tags: product.tags && product.tags.length > 0 
        ? product.tags.map((labelId: string) => {
            const label = productLabels.find((l: any) => l._id === labelId || l.id === labelId);
            return label ? (isRTL ? label.nameAr : label.nameEn) : labelId;
          }).join(', ')
        : (isRTL ? 'لا يوجد تصنيف' : 'No Labels'),
      descriptionAr: product.descriptionAr,
      descriptionEn: product.descriptionEn,
      barcode: product.barcode || '',
      specifications: product.specifications && product.specifications.length > 0 
        ? product.specifications.map((spec: any) => {
            // إذا كانت البيانات كاملة من API (embedded documents)
            if (typeof spec === 'object' && spec.name && spec.value) {
              return `${spec.name}: ${spec.value}`;
            }
            // إذا كانت مجرد ID، نبحث عن المواصفة في البيانات المحملة
            const specData = specifications.find((s: any) => s._id === spec || s.id === spec);
            return specData ? (isRTL ? specData.descriptionAr : specData.descriptionEn) : spec;
          }).join(', ')
        : (isRTL ? 'لا توجد مواصفات' : 'No Specifications'),
    images: product.mainImage ? 1 : (product.images?.length || 0),
    colors: product.colors?.length || 0,
    originalProduct: product,
    };
  }) : [];
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
    if (!value || value === '') {
      return (
        <span className="text-gray-500 text-sm">
          {isRTL ? 'لا يوجد باركود' : 'No Barcode'}
        </span>
      );
    }
    
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
  //-------------------------------------------- columns -------------------------------------------
  const columns = [
    { key: 'id', label: { ar: 'الرقم', en: 'ID' }, type: 'number' as const },
    { key: 'image', label: { ar: 'الصورة', en: 'Image' }, type: 'image' as const },
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
    { key: 'barcode', label: { ar: 'الباركود', en: 'Barcode' }, type: 'text' as const, render: renderBarcode },
    { key: 'images', label: { ar: 'عدد الصور', en: 'Images Count' }, type: 'number' as const },
    { key: 'colors', label: { ar: 'عدد الألوان', en: 'Colors Count' }, type: 'number' as const },
    { key: 'actions', label: { ar: 'العمليات', en: 'Actions' }, type: 'text' as const, render: renderActions, showControls: false },
  ];
  //-------------------------------------------- handleFormChange -------------------------------------------
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'maintainStock') {
      if (e.target.value === 'N') {
        setForm({ ...form, maintainStock: 'N', availableQuantity: 0 });
      } else {
        setForm({ ...form, maintainStock: 'Y' });
      }
    } else if (e.target.name === 'availableQuantity') {
      const val = e.target.value;
      const numVal = val === '' ? 0 : Number(val);
      if (!numVal || numVal <= 0) {
        setForm({ ...form, availableQuantity: numVal, maintainStock: 'N' });
      } else {
        setForm({ ...form, availableQuantity: numVal, maintainStock: 'Y' });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  //-------------------------------------------- handleProductLabelsChange -------------------------------------------
  const handleTagsChange = (values: string[]) => {
    setForm({ ...form, tags: values });
  };
  //-------------------------------------------- handleImageChange -------------------------------------------
  const handleImageChange = (files: File | File[] | null) => {
    if (!files) {
      setForm({ ...form, images: [] });
      return;
    }
    const fileArray = Array.isArray(files) ? files : [files];
    const imageUrls = fileArray.map(file => URL.createObjectURL(file));
    setForm({ ...form, images: imageUrls });
  };
  //-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        productSpecifications: form.productSpecifications || [],
        barcode: form.barcode || '',
        colors: Array.isArray(form.colors)
          ? form.colors.map((variant: any) => Array.isArray(variant.colors) ? variant.colors : [])
          : [],
        images: form.images || [],
        isActive: true,
      };

      // التحقق من صحة البيانات
      const errors = validateProduct(productData, isRTL, editProduct?._id || editProduct?.id);
      if (Object.keys(errors).length > 0) {
        console.error('Validation errors:', errors);
        return;
      }

      // حفظ المنتج
      const editId = editProduct?._id || editProduct?.id;
      await saveProduct(productData, editId, isRTL);
      
      setShowDrawer(false);
      setEditProduct(null);
      setDrawerMode('add');
      setForm(initialForm);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };
  //-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (product: any) => {
    const formColors = Array.isArray(product.originalProduct.colors)
      ? product.originalProduct.colors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    
    const maintainStock = (product.originalProduct.availableQuantity || product.originalProduct.stock || 0) > 0 ? 'Y' : 'N';
    let unitId = product.originalProduct.unit?._id || product.originalProduct.unitId;
    let categoryId = product.originalProduct.category?._id || product.originalProduct.categoryId;
    let subcategoryId = product.originalProduct.subcategory?._id || product.originalProduct.subcategoryId;
    let storeId = product.originalProduct.store?._id || product.originalProduct.storeId;
    
    const newForm = {
      ...product.originalProduct,
      colors: formColors,
        // name: isRTL ? product.originalProduct.nameAr : product.originalProduct.nameEn,
      nameAr: product.originalProduct.nameAr || '',
      nameEn: product.originalProduct.nameEn || '',

      descriptionAr: product.originalProduct.descriptionAr || '',
      descriptionEn: product.originalProduct.descriptionEn || '',
      maintainStock,
      unitId: unitId ? String(unitId) : '',
      categoryId: categoryId ? String(categoryId) : '',
      subcategoryId: subcategoryId ? String(subcategoryId) : '',
      storeId: storeId ? String(storeId) : '',
      tags: product.originalProduct.tags || [],
      productSpecifications: product.originalProduct.specifications || [],
      visibility: product.originalProduct.visibility ? 'Y' : 'N',
      costPrice: product.originalProduct.costPrice || '',
      compareAtPrice: product.originalProduct.compareAtPrice || '',
      barcode: product.originalProduct.barcode || '',
    };
    
    setForm(newForm);
    setEditProduct(product.originalProduct);
    setDrawerMode('edit');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleAddClick -------------------------------------------
  const handleAddClick = () => {
    setForm(initialForm);
    setEditProduct(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };
  //-------------------------------------------- handleDrawerClose -------------------------------------------
  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditProduct(null);
    setDrawerMode('add');
    setForm(initialForm);
  };
  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        const productId = selectedProduct.originalProduct._id || selectedProduct.originalProduct.id;
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
        [isRTL ? 'الباركود' : 'Barcode']: product.barcode,
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

      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto">
        <CustomTable 
          columns={columns} 
          data={tableData} 
          onFilteredDataChange={setVisibleTableData}
          autoScrollToFirst={true}
        />
      </div>

      {/* ------------------------------------------- ProductsDrawer ------------------------------------------- */}
      <ProductsDrawer
        open={showDrawer}
        onClose={handleDrawerClose}
        isRTL={isRTL}
        title={drawerMode === 'edit' ? t('products.edit') || 'Edit Product' : t('products.add')}
        form={form}
        onFormChange={handleFormChange}
        onTagsChange={handleTagsChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        categories={categories as any}
       
        tags={productLabels}
        units={units}
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