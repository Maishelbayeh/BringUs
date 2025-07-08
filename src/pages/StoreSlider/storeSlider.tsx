import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomButton from '@/components/common/CustomButton';
import PermissionModal from '../../components/common/PermissionModal';

const initialProducts: any[] = [
  { id: 1, name: 'iPhone 15', categoryId: 1, subcategoryId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', description: 'Latest Apple smartphone' },
  { id: 2, name: 'MacBook Pro', categoryId: 1, subcategoryId: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', description: 'Apple laptop' },
  { id: 3, name: 'T-shirt', categoryId: 2, subcategoryId: 3, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', description: 'Cotton T-shirt' },
  { id: 4, name: 'Novel XYZ', categoryId: 4, subcategoryId: 7, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', description: 'Fiction novel' },
  { id: 5, name: 'Football', categoryId: 7, subcategoryId: 13, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', description: 'Sports ball' },
  { id: 6, name: 'General Product', categoryId: 5, subcategoryId: '', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', description: 'A general product' },
];

// Minimal form state for StoreSlider
const initialForm = { image: '' };

const StoreSliderPage: React.FC = () => {

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subcategoryIdParam) setSelectedSubcategoryId(subcategoryIdParam);
  }, [categoryIdParam, subcategoryIdParam]);

  const filteredProducts = products.filter(product =>
    (selectedCategoryId ? product.categoryId === Number(selectedCategoryId) : true) &&
    (selectedSubcategoryId ? product.subcategoryId === Number(selectedSubcategoryId) : true) &&
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setForm({ ...form, image: '' });
      return;
    }
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setForm({ ...form, image: imageUrl });
  };
  const handleEdit = (product: any) => {
    setForm(product);
    setEditProduct(product);
    setDrawerMode('edit');
    setShowDrawer(true);
  };
  const handleAdd = () => {
    setForm(initialForm);
    setEditProduct(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };
  const handleDelete = (product?: any) => {
    const productToDelete = product || editProduct;
    if (productToDelete) {
      setProductToDelete(productToDelete);
      if (product) {
        // إذا تم الضغط على أيقونة الحذف مباشرة، لا نفتح الدرج
        setShowDeleteModal(true);
      } else {
        // إذا تم الضغط من داخل الدرج
        setShowDrawer(false);
        setShowDeleteModal(true);
      }
    }
  };
  
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
    setShowDeleteModal(false);
  };

  const handleSave = (formData: any) => {
    if (drawerMode === 'edit' && editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...editProduct, ...formData } : p));
    } else {
    setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setShowDrawer(false);
    setEditProduct(null);
    setForm(initialForm);
  };

  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.storeSlider') || 'Store Slider', href: '/store-slider' }
      ]} isRtl={isRTL} />
      <HeaderWithAction
        title={t('sideBar.storeSlider') || 'Store Slider'}
        addLabel={t('storeSlider.addButton') || t('products.add')}
        onAdd={handleAdd}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        count={filteredProducts.length}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('storeSlider.searchPlaceholder') || t('products.search')}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6  gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer bg-gradient-to-br from-primary/5 via-white to-gray-100 rounded-2xl shadow-lg border border-primary/10 hover:shadow-2xl transition flex flex-col items-stretch min-h-[320px]"
            onClick={() => handleEdit(product)}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="relative w-full h-48 rounded-t-2xl overflow-hidden flex items-center justify-center bg-gray-100">
              {/* أيقونة الحذف */}
              <button
                className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110`}
                onClick={e => { e.stopPropagation(); handleDelete(product); }}
                title={t('common.delete')}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <img
                src={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2 p-4">
              <h2 className="text-lg font-bold text-primary truncate">{product.name}</h2>
              <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditProduct(null); setForm(initialForm); }}
        onSave={handleSave}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        isRTL={isRTL}
        mode="slider"
        renderFooter={(
          <div className={`flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl`}>
            <CustomButton
              color="white"
              textColor="primary"
              text={t('common.cancel')}
              action={() => { setShowDrawer(false); setEditProduct(null); setForm(initialForm); }}
              bordercolor="primary"
            />
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {drawerMode === 'edit' && (
                <CustomButton
                  color="red-100"
                  textColor="red-700"
                  text={t('common.delete', 'Delete')}
                  action={() => handleDelete(editProduct)}
                  className="min-w-[100px]"
                />
              )}
              <CustomButton
                color="primary"
                textColor="white"
                text={t('common.save')}
                type="submit"
                onClick={() => handleSave(form)}
                className="min-w-[100px]"
              />
            </div>
          </div>
        )}
      />
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('storeSlider.deleteConfirmTitle') || 'Confirm Delete Product from Slider'}
        message={t('storeSlider.deleteConfirmMessage') || 'Are you sure you want to delete this product from the slider?'}
        itemName={productToDelete ? productToDelete.name : ''}
        itemType={t('storeSlider.product') || 'product'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default StoreSliderPage; 
