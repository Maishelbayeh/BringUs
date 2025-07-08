import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import PermissionModal from '../../components/common/PermissionModal';
import { CustomTable } from '../../components/common/CustomTable';
import * as XLSX from 'xlsx';
import { initialCategories } from '../../data/initialCategories';
import { initialProducts } from '../../data/initialProducts';
import { initialSubcategories } from '../subcategories/subcategories';
import { productLabelOptions } from '../../data/productLabelOptions';
import { unitOptions } from '../../data/unitOptions';
//-------------------------------------------- ColorVariant -------------------------------------------
interface ColorVariant {
  id: string;
  colors: string[];
}
//-------------------------------------------- initialForm -------------------------------------------
const initialForm: {
  name: string;
  categoryId: string;
  subcategoryId: string;
  visibility: string;
  unit: string;
  price: string;
  originalPrice: string;
  wholesalePrice: string;
  productLabel: number;
  productOrder: string;
  maintainStock: string;
  availableQuantity: number;
  description: string;
  parcode: string;
  productSpecifications: string[];
  colors: ColorVariant[];
  images: string[];
  productVideo: string;
} = {
  name: '',
  categoryId: '',
  subcategoryId: '',
  visibility: 'Y',
  unit: '',
  price: '',
  originalPrice: '',
  wholesalePrice: '',
  productLabel: 1,
  productOrder: '',
  maintainStock: 'Y',
  availableQuantity: 0,
  description: '',
  parcode: '',
  productSpecifications: [],
  colors: [],
  images: [],
  productVideo: '',
};
//-------------------------------------------- ProductsPage -------------------------------------------
const ProductsPage: React.FC = () => {
  const [categories] = useState(initialCategories);
  const [subcategories] = useState(initialSubcategories);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');
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
  let filteredProducts = products.filter(product =>
    (selectedCategoryId ? product.categoryId === Number(selectedCategoryId) : true) &&
    (selectedSubcategoryId ? product.subcategoryId === Number(selectedSubcategoryId) : true) &&
    (isRTL ? product.nameAr.toLowerCase().includes(search.toLowerCase()) : product.nameEn.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === 'alpha') {
    filteredProducts = [...filteredProducts].sort((a, b) => (isRTL ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn)));
  } else if (sort === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.id - a.id);
  } else if (sort === 'oldest') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.id - b.id);
  }
  //-------------------------------------------- getCategoryName -------------------------------------------    
  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return isRTL ? (cat?.nameAr || '') : (cat?.nameEn || '');
  };
  //-------------------------------------------- getSubcategoryName -------------------------------------------
  const getSubcategoryName = (subId: number) => {
    const sub = subcategories.find(s => s.id === subId);
    return isRTL ? (sub?.nameAr || '') : (sub?.nameEn || '');
  };
  //-------------------------------------------- getLabelName -------------------------------------------
  const getLabelName = (label: string | number) => {
    const found = productLabelOptions.find(l => String(l.id) === String(label));
    return found ? (isRTL ? found.nameAr : found.nameEn) : String(label);
  };
  //-------------------------------------------- getUnitName -------------------------------------------
  const getUnitName = (unitId: number) => {
    const unit = unitOptions.find(u => u.id === unitId);
    return isRTL ? (unit?.nameAr || '') : (unit?.nameEn || '');
  };
  //-------------------------------------------- tableData -------------------------------------------
  const tableData = filteredProducts.map(product => ({
    id: product.id,
    image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
    name: isRTL ? product.nameAr : product.nameEn,
    category: getCategoryName(product.categoryId),
    subcategory: getSubcategoryName(product.subcategoryId),
    price: product.price,
    originalPrice: product.originalPrice,
    wholesalePrice: product.wholesalePrice,
    unit: getUnitName(product.unitId),
    availableQuantity: product.availableQuantity,
    maintainStock: product.maintainStock === 'Y' ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No'),
    visibility: product.visibility === 'Y' ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden'),
    productLabel: getLabelName(product.productLabel),
    description: isRTL ? product.descriptionAr : product.descriptionEn,
    parcode: product.parcode,
    images: product.image ? 1 : (product.images?.length || 0),
    colors: product.colors?.length || 0,
    originalProduct: product,
  }));
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
    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' as const },
    { key: 'category', label: { ar: 'الفئة', en: 'Category' }, type: 'text' as const },
    { key: 'subcategory', label: { ar: 'الفئة الفرعية', en: 'Subcategory' }, type: 'text' as const },
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number' as const, render: renderPrice },
    { key: 'wholesalePrice', label: { ar: 'سعر الجملة', en: 'Wholesale Price' }, type: 'number' as const },
    { key: 'unit', label: { ar: 'الوحدة', en: 'Unit' }, type: 'text' as const },
    { key: 'availableQuantity', label: { ar: 'الكمية المتوفرة', en: 'Available Quantity' }, type: 'number' as const, render: renderStock },
    { key: 'maintainStock', label: { ar: 'إدارة المخزون', en: 'Stock Management' }, type: 'text' as const },
    { key: 'visibility', label: { ar: 'الظهور', en: 'Visibility' }, type: 'status' as const, render: renderVisibility },
    { key: 'productLabel', label: { ar: 'التصنيف', en: 'Label' }, type: 'text' as const },
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saveColors = Array.isArray(form.colors)
      ? form.colors.map((variant: any) => Array.isArray(variant.colors) ? variant.colors : [])
      : [];
    const productToSave = { ...form, colors: saveColors };
    
    if (drawerMode === 'edit' && editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...editProduct, ...productToSave } : p));
    } else {
      setProducts([...products, { ...productToSave, id: Date.now() }]);
    }
    setShowDrawer(false);
    setEditProduct(null);
    setDrawerMode('add');
    setForm(initialForm);
  };
  //-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (product: any) => {
    const formColors = Array.isArray(product.originalProduct.colors)
      ? product.originalProduct.colors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    
    const maintainStock = product.originalProduct.availableQuantity > 0 ? 'Y' : 'N';
    let unitId = product.originalProduct.unitId;
    if (!unitId && product.originalProduct.unit) {
      const found = unitOptions.find(u => u.nameAr === product.originalProduct.unit || u.nameEn === product.originalProduct.unit);
      unitId = found ? found.id : '';
    }
    
    setForm({
      ...product.originalProduct,
      colors: formColors,
      name: isRTL ? product.originalProduct.nameAr : product.originalProduct.nameEn,
      description: isRTL ? product.originalProduct.descriptionAr : product.originalProduct.descriptionEn,
      maintainStock,
      unitId: unitId ? String(unitId) : '',
    });
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
  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.originalProduct.id));
      setSelectedProduct(null);
    }
    setShowDeleteModal(false);
  };
  //-------------------------------------------- handleDownloadExcel -------------------------------------------
  const handleDownloadExcel = () => {
    const rows: any[] = [];
    visibleTableData.forEach((product) => {
      rows.push({
        [isRTL ? 'اسم المنتج' : 'Product Name']: product.name,
        [isRTL ? 'الفئة' : 'Category']: product.category,
        [isRTL ? 'الفئة الفرعية' : 'Subcategory']: product.subcategory,
        [isRTL ? 'السعر' : 'Price']: product.price,
        [isRTL ? 'سعر الجملة' : 'Wholesale Price']: product.wholesalePrice,
        [isRTL ? 'الوحدة' : 'Unit']: product.unit,
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
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        categories={categories as any}
        subcategories={subcategories as any}
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