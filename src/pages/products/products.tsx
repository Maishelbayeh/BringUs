import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import * as XLSX from 'xlsx';
import { initialCategories } from '../../data/initialCategories';
import ProductCard from './ProductCard';
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
    //-------------------------------------------- imageUrls -------------------------------------------
    const fileArray = Array.isArray(files) ? files : [files];
    const imageUrls = fileArray.map(file => URL.createObjectURL(file));
    setForm({ ...form, images: imageUrls });
  };
  //-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // تحويل الألوان إلى مصفوفة مصفوفات قبل الحفظ
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
    //-------------------------------------------- console.log -------------------------------------------
    console.log("---- Form Values ----");
    Object.entries(productToSave).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  };
  //-------------------------------------------- handleCardClick -------------------------------------------
  const handleCardClick = (product: any) => {
    // تحويل الألوان إلى الشكل المطلوب للفورم
    const formColors = Array.isArray(product.colors)
      ? product.colors.map((arr: string[], idx: number) => ({
          id: String(idx) + '-' + Date.now(),
          colors: arr
        }))
      : [];
    // منطق تفعيل إدارة المخزون حسب الكمية المتوفرة
    const maintainStock = product.availableQuantity > 0 ? 'Y' : 'N';
    // استخراج unitId من unitOptions إذا كان المنتج يحتوي على unit نص فقط
    let unitId = product.unitId;
    if (!unitId && product.unit) {
      const found = unitOptions.find(u => u.nameAr === product.unit || u.nameEn === product.unit);
      unitId = found ? found.id : '';
    }
    setForm({
      ...product,
      colors: formColors,
      name: isRTL ? product.nameAr : product.nameEn,
      description: isRTL ? product.descriptionAr : product.descriptionEn,
      maintainStock,
      unitId: unitId ? String(unitId) : '',
    });
    setEditProduct(product);
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
  //-------------------------------------------- handleDownloadExcel -------------------------------------------
  const handleDownloadExcel = () => {
    const rows: any[] = [];
    filteredProducts.forEach((product) => {
      rows.push({
        [isRTL ? 'اسم المنتج' : 'Product Name']: isRTL ? product.nameAr : product.nameEn,
        [isRTL ? 'الفئة' : 'Category']: getCategoryName(product.categoryId),
        [isRTL ? 'الفئة الفرعية' : 'Subcategory']: getSubcategoryName(product.subcategoryId),
        [isRTL ? 'الوصف' : 'Description']: product.description,
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products.xlsx');
  };
  //-------------------------------------------- return -------------------------------------------   
  return (
    <div className="sm:p-4 w-full" >
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
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('products.search') || 'Search products...'}
        showSort={true}
        sortValue={sort}
        onSortChange={e => setSort(e.target.value)}
        sortOptions={sortOptions}
        onDownload={handleDownloadExcel}
        count={filteredProducts.length}
      />
      {/* ------------------------------------------- ProductCard ------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isRTL={isRTL}
            onClick={handleCardClick}
            getCategoryName={getCategoryName}
            getLabelName={getLabelName}
          />
        ))}
      </div>
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
    </div>
  );
};

export default ProductsPage; 