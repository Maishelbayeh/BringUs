import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import * as XLSX from 'xlsx';
import { initialCategories } from '../categories/initialCategories';
import ProductCard from './ProductCard';
import { initialProducts } from './initialProducts';
import { initialSubcategories } from '../subcategories/subcategories';


// Add ColorVariant type for form
interface ColorVariant {
  id: string;
  colors: string[];
}


const productLabelOptions = [
  { id: 1, nameAr: 'عادي', nameEn: 'Regular' },
  { id: 2, nameAr: 'عرض', nameEn: 'Offer' },
  { id: 3, nameAr: 'مميز', nameEn: 'Featured' },
  { id: 4, nameAr: 'جديد', nameEn: 'New' },
];


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

  const sortOptions = [
    { value: 'default', label: t('products.sort.default') || 'Default' },
    { value: 'alpha', label: t('products.sort.alpha') || 'A-Z' },
    { value: 'newest', label: t('products.sort.newest') || 'Newest' },
    { value: 'oldest', label: t('products.sort.oldest') || 'Oldest' },
  ];

  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subcategoryIdParam) setSelectedSubcategoryId(subcategoryIdParam);
  }, [categoryIdParam, subcategoryIdParam]);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'maintainStock') {
      // إذا تم إلغاء التفعيل، امسح الكمية المتوفرة
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
  const handleImageChange = (files: File | File[] | null) => {
    if (!files) {
      setForm({ ...form, images: [] });
      return;
    }
    const fileArray = Array.isArray(files) ? files : [files];
    const imageUrls = fileArray.map(file => URL.createObjectURL(file));
    setForm({ ...form, images: imageUrls });
  };
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
    // طباعة جميع القيم في الكونسول بشكل منسق
    console.log("---- Form Values ----");
    Object.entries(productToSave).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  };

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
    setForm({
      ...product,
      colors: formColors,
      name: isRTL ? product.nameAr : product.nameEn,
      description: isRTL ? product.descriptionAr : product.descriptionEn,
      maintainStock,
    });
    setEditProduct(product);
    setDrawerMode('edit');
    setShowDrawer(true);
  };

  const handleAddClick = () => {
    setForm(initialForm);
    setEditProduct(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditProduct(null);
    setDrawerMode('add');
    setForm(initialForm);
  };

  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.id === catId);
    return isRTL ? (cat?.nameAr || '') : (cat?.nameEn || '');
  };
  const getSubcategoryName = (subId: number) => {
    const sub = subcategories.find(s => s.id === subId);
    return isRTL ? (sub?.nameAr || '') : (sub?.nameEn || '');
  };

  const getLabelName = (label: string | number) => {
    const found = productLabelOptions.find(l => String(l.id) === String(label));
    return found ? (isRTL ? found.nameAr : found.nameEn) : String(label);
  };

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

  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.products') || 'Products', href: '/products' }
      ]} isRtl={isRTL} />

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