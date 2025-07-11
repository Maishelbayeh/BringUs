import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { CogIcon, TrashIcon } from '@heroicons/react/24/outline';
import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
//-------------------------------------------- initialVideos -------------------------------------------
const initialVideos: any[] = [
  { id: 1, name: 'Store Tour', url: 'https://www.youtube.com/watch?v=ObXiEqzjx9U', description: 'Take a tour in our store!' },
  { id: 2, name: 'Promo Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Our latest promo.' },
];
//-------------------------------------------- initialForm -------------------------------------------
const initialForm = { name: '', url: '', description: '' };
//-------------------------------------------- StoreVideoPage -------------------------------------------
const StoreVideoPage: React.FC = () => {
  const [videos, setVideos] = useState<any[]>(initialVideos);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<any | null>(null);
//-------------------------------------------- handleSave -------------------------------------------
  const handleSave = (formData: any) => {
    if (drawerMode === 'edit' && editId) {
      setVideos(videos.map(v => v.id === editId ? { ...v, ...formData } : v));
    } else {
      setVideos([...videos, { ...formData, id: Date.now() }]);
    }
    setShowDrawer(false);
    setForm(initialForm);
    setEditId(null);
    setDrawerMode('add');
  };
//-------------------------------------------- handleAddVideo -------------------------------------------
  const handleAddVideo = () => {
    setForm(initialForm);
    setDrawerMode('add');
    setShowDrawer(true);
  };
//-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (video: any) => {
    setForm(video);
    setEditId(video.id);
    setDrawerMode('edit');
    setShowDrawer(true);
  };

  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (video: any) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };
  
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = () => {
    if (videoToDelete) {
      setVideos(videos.filter(v => v.id !== videoToDelete.id));
      setVideoToDelete(null);
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.storeVideos') || 'Store Videos', href: '/store-videos' }
      ]} isRtl={isRTL} />
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('sideBar.storeVideos') || 'Store Videos'}
        addLabel={t('storeVideos.addButton')}
        onAdd={handleAddVideo}
        isRtl={isRTL}
        count={videos.length}
      />
      {/* ------------------------------------------- videos ------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {videos.map((video) => {
          let videoUrl = video.url;
          let youtubeId = '';
          let isYoutube = false;
          if (videoUrl.includes('embed/')) {
            youtubeId = videoUrl.split('embed/')[1]?.split(/[?&]/)[0];
            isYoutube = true;
          } else if (videoUrl.includes('watch?v=')) {
            youtubeId = videoUrl.split('watch?v=')[1]?.split(/[?&]/)[0];
            isYoutube = true;
          }
          return (
            <div
              key={video.id}
              className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition group flex flex-col overflow-hidden"
            >
              {/* ------------------------------------------- زر الإعدادات دائماً ظاهر ------------------------------------------- */}
              <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                <button
                  className="bg-primary/90 hover:bg-primary text-white rounded-full p-2 shadow hover:scale-110 transition-transform duration-200"
                  onClick={e => { e.stopPropagation(); handleEdit(video); }}
                  title={t('storeVideos.edit')}
                >
                  <CogIcon className="w-6 h-6" />
                </button>
                <button
                  className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2 shadow hover:scale-110 transition-transform duration-200"
                  onClick={e => { e.stopPropagation(); handleDelete(video); }}
                  title={t('common.delete')}
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
              {/* ------------------------------------------- صورة الفيديو أو الفيديو نفسه ------------------------------------------- */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer"
                onClick={() => isYoutube && setOpenVideo(youtubeId)}
              >
                {isYoutube ? (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute inset-0 flex items-center justify-center"
                      title={t('storeVideos.play')}
                    >
                      <svg width={64} height={64} viewBox="0 0 64 64" className="drop-shadow-lg">
                        <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.5)" />
                        <polygon points="26,20 50,32 26,44" fill="white" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <img
                    src={video.url}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* ------------------------------------------- اسم الفيديو والوصف ------------------------------------------- */}
              <div className="p-3 flex flex-col gap-1">
                <a
                  href={isYoutube ? `https://www.youtube.com/watch?v=${youtubeId}` : video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-primary hover:underline truncate"
                  title={video.name}
                >
                  {video.name}
                </a>
                {video.description && (
                  <span className="text-xs text-gray-500 truncate">{video.description}</span>
                )}
              </div>
            </div>
          );
        })}
        {/* ------------------------------------------- Modal ------------------------------------------- */}
        <Dialog open={!!openVideo} onClose={() => setOpenVideo(null)} maxWidth="md">
          <div className="bg-black">
            {openVideo && (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${openVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full aspect-video"
              />
            )}
          </div>
        </Dialog>
      </div>
      {/* ------------------------------------------- StoreSliderDrawer ------------------------------------------- */}
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditId(null); setForm(initialForm); }}
        onSave={handleSave}
        form={form}
        onFormChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        onImageChange={() => {}}
        isRTL={isRTL}
        mode={'video'}
      />
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('storeVideos.deleteConfirmTitle') || 'Confirm Delete Video'}
        message={t('storeVideos.deleteConfirmMessage') || 'Are you sure you want to delete this video?'}
        itemName={videoToDelete ? videoToDelete.name : ''}
        itemType={t('storeVideos.video') || 'video'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default StoreVideoPage; 