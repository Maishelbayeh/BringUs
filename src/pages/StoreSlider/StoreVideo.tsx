import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { CogIcon } from '@heroicons/react/24/outline';
import CustomNav from '../../components/common/CustomNav';
import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';





const initialProducts: any[] = [
  { id: 1, name: 'iPhone 15', categoryId: 1, subcategoryId: 1, image: 'https://www.youtube.com/watch?v=ObXiEqzjx9U', description: 'Latest Apple smartphone' },
  { id: 2, name: 'MacBook Pro', categoryId: 1, subcategoryId: 2, image: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Apple laptop' },
  { id: 3, name: 'T-shirt', categoryId: 2, subcategoryId: 3, image: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Cotton T-shirt' },
];

// Minimal form state for StoreSlider
const initialForm = { image: '' };

const StoreVideoPage: React.FC = () => {

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
  const [drawerMode, setDrawerMode] = useState<'slider' | 'video'>('video');
  const [editProduct, setEditProduct] = useState<any | null>(null);

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null },
    { name: t('sideBar.store') || 'Store', id: 1 },
    { name: t('sideBar.storeVideos') || 'Store Videos', id: 2 }
  ];

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
  const handleSave = (formData: any) => {
    setProducts([...products, { ...formData, id: Date.now() }]);
    setShowDrawer(false);
    setForm(initialForm);
  };
  const handleAddVideo = () => {
    setDrawerMode('video');
    setShowDrawer(true);
  };
  const handleEdit = (product: any) => {
    setForm(product);
    setEditProduct(product);
    setDrawerMode('video');
    setShowDrawer(true);
  };

  return (
    <div className="p-4 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={item.id}>
            <span className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`} onClick={() => setSelectedCategoryId('')}>{item.name}</span>
            {idx < breadcrumb.length - 1 && <ChevronRightIcon className={`h-4 w-4 mx-2 ${isRTL ? 'rotate-180' : ''}`} />}
          </React.Fragment>
        ))}
      </nav>
      <CustomNav
        isRTL={isRTL}
        t={t}
        onAdd={handleAddVideo}
        search={search}
        setSearch={setSearch}
        title={t('sideBar.storeVideos') || 'Store Videos'}
        addButtonText={t('storeVideos.addButton')}
        searchPlaceholder={t('storeVideos.searchPlaceholder') || t('products.search')}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
        {filteredProducts.map((product) => {
          // Extract YouTube video ID for link
          let videoUrl = product.image;
          let youtubeWatchUrl = videoUrl;
          let youtubeId = '';
          let isYoutube = false;
          if (videoUrl.includes('embed/')) {
            youtubeId = videoUrl.split('embed/')[1]?.split(/[?&]/)[0];
            youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
            isYoutube = true;
          } else if (videoUrl.includes('watch?v=')) {
            youtubeId = videoUrl.split('watch?v=')[1]?.split(/[?&]/)[0];
            youtubeWatchUrl = videoUrl;
            isYoutube = true;
          }

          const [showVideo, setShowVideo] = React.useState(false);

          return (
            <div
              key={product.id}
              className="relative p-4 flex flex-col items-center gap-2 ring-1 ring-primary/20 hover:ring-primary transition group"
            >
              <div className="relative w-40 h-40 rounded-full overflow-hidden flex items-center justify-center bg-black">
                <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden aspect-square">
                  {isYoutube && !showVideo ? (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer rounded-full aspect-square"
                        onClick={() => setShowVideo(true)}
                      />
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition rounded-full aspect-square"
                        onClick={() => setShowVideo(true)}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" className="text-white">
                          <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
                          <polygon points="20,16 36,24 20,32" fill="white" />
                        </svg>
                      </button>
                    </>
                  ) : isYoutube && showVideo ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={product.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full object-cover rounded-full aspect-square"
                      style={{ borderRadius: '9999px' }}
                    />
                  ) : (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-full aspect-square"
                    />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-full">
                  <CogIcon
                    className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-8 transition-all duration-300 cursor-pointer"
                    onClick={e => { e.stopPropagation(); handleEdit(product); }}
                  />
                </div>
              </div>
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-primary hover:underline mt-2"
              >
                {product.name}
              </a>
            </div>
          );
        })}
      </div>
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditProduct(null); }}
        onSave={handleSave}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        isRTL={isRTL}
        mode={drawerMode}
      />
    </div>
  );
};

export default StoreVideoPage; 