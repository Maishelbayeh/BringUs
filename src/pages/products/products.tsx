import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import * as XLSX from 'xlsx';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';

// Add ColorVariant type for form
interface ColorVariant {
  id: string;
  colors: string[];
}

const initialCategories = [
  { id: 1, nameAr: 'الإلكترونيات' ,nameEn: 'Electronics'},
  { id: 2, nameAr: 'الملابس' ,nameEn: 'Fashion'},
  { id: 4, nameAr: 'الكتب' ,nameEn: 'Books'},
  { id: 7, nameAr: 'الرياضة' ,nameEn: 'Sports'},
  { id: 5, nameAr: 'الألعاب' ,nameEn: 'Toys'},
];
const productLabelOptions = [
  { id: 1, nameAr: 'عادي', nameEn: 'Regular' },
  { id: 2, nameAr: 'عرض', nameEn: 'Offer' },
  { id: 3, nameAr: 'مميز', nameEn: 'Featured' },
  { id: 4, nameAr: 'جديد', nameEn: 'New' },
];
const initialSubcategories = [
  { id: 1, nameAr: 'الهواتف الذكية' ,nameEn: 'Smartphones', categoryId: 1 },
  { id: 2, nameAr: 'الكمبيوترات' ,nameEn: 'Laptops', categoryId: 1 },
  { id: 3, nameAr: 'الرجال' ,nameEn: 'Men', categoryId: 2 },
  { id: 4, nameAr: 'النساء' ,nameEn: 'Women', categoryId: 2 },
  { id: 7, nameAr: 'الروايات' ,nameEn: 'Novels', categoryId: 4 },
  { id: 13, nameAr: 'الكرة الطائرة' ,nameEn: 'Football', categoryId: 7 },
];

const initialProducts: any[] = [
  { id: 1, nameEn: 'iPhone 15',nameAr:'ايفون 15',
     categoryId: 1, subcategoryId: 1, 
     image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      descriptionEn: 'Latest Apple smartphone',descriptionAr:'اخر اصدار ابل', 
      visibility: 'Y', productLabel: 1, productOrder: 1, colors: [['#000000'], ['#FFFFFF', '#FF0000'], ['#00CED1', '#FFD700', '#FF69B4']], price: 1000, availableQuantity: 10 },
  { id: 2, nameEn: 'MacBook Pro',nameAr:'ماك بوك برو', categoryId: 1, subcategoryId: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', descriptionEn: 'Apple laptop',descriptionAr:'اخر اصدار ابل', visibility: 'N', productLabel: 3, productOrder: 2, colors: [['#808080'], ['#C0C0C0', '#4682B4']], price: 2000, availableQuantity: 100},
  { id: 3, nameEn: 'T-shirt', nameAr:'بلوزة',categoryId: 2, subcategoryId: 3, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', descriptionEn: 'Cotton T-shirt',descriptionAr:'اخر اصدار ابل', visibility: 'Y', productLabel: 2, productOrder: 3, colors: [['#FFA500'], ['#FFC0CB', '#008000'], ['#FF69B4', '#FFD700', '#00CED1']], price: 50,availableQuantity: 58 },
  { id: 4, nameEn: 'Novel XYZ',nameAr:'نوفل', categoryId: 4, subcategoryId: 7, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', descriptionEn: 'Fiction novel',descriptionAr:'اخر اصدار ابل', visibility: 'Y', productLabel: 4, productOrder: 4, colors: [['#800080'], ['#FFD700', '#A52A2A', '#00FF00']], price: 30 ,availableQuantity: 10},
  { id: 5, nameEn: 'General Product',nameAr:'جينيرال برودكت', categoryId: 5, subcategoryId: '', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', descriptionEn: 'A general product',descriptionAr:'اخر اصدار ابل', visibility: 'Y', productLabel: 1, productOrder: 5, colors: [['#00FF00'], ['#ADD8E6', '#F5DEB3'], ['#FF0000', '#B22222', '#FFC0CB']],price: 120 ,availableQuantity: 10},
  { id: 6, nameEn: 'General Product', nameAr:'جينيرال2',categoryId: 5, subcategoryId: '', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', descriptionEn: 'A general product',descriptionAr:'اخر اصدار ابل', visibility: 'N', productLabel: 3, productOrder: 6, colors: [['#FF69B4'], ['#00CED1', '#FFD700'], ['#0000FF', '#FFA500', '#008000']], price: 120 ,availableQuantity: 10},
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
  availableQuantity: string;
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
  availableQuantity: '',
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
    setForm({ ...product, colors: formColors ,name:isRTL ? product.nameAr : product.nameEn,description:isRTL ? product.descriptionAr : product.descriptionEn});
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
    <div className="p-4 w-full" >
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
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
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