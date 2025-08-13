import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useStoreUrls } from '../../hooks/useStoreUrls';

interface CategoryTreeProps {
  categories: any[]; 
  isRTL: boolean;
  onAdd: (parentId?: number | null) => void;
  onEdit: (cat: any) => void;
  onDelete: (cat: any) => void;
  level?: number;
}

const STORE_ID_KEY = 'storeId';
const DEFAULT_STORE_ID = '687505893fbf3098648bfe16';

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, isRTL, onAdd, onEdit, onDelete, level = 0 }) => {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { storeSlug } = useStoreUrls();
  //CONSOLE.log(categories);
  const storeId = typeof window !== 'undefined' ? (localStorage.getItem(STORE_ID_KEY) || DEFAULT_STORE_ID) : DEFAULT_STORE_ID;
  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <ul className={`pl-0 flex flex-col gap-1`}>
      {categories.map(cat => (
        <li key={cat.id}
          className={`group flex rounded-lg flex-col relative ${level === 0 ? 'pb-2 border-primary/10 last:border-b-0' : ''} ${level === 0 ? 'sm:border-t-0 border-t-4 border-primary' : ''}`}
          style={{ [isRTL ? 'marginRight' : 'marginLeft']: level * 5 }}>
          <div
            className={`flex items-center rounded-lg px-3 py-2 cursor-pointer transition ${isRTL ? 'flex-row-reverse' : ''} ${level === 0 ? 'bg-primary/5 hover:bg-primary/10' : 'bg-white hover:bg-primary/5'}`}
            onClick={e => {
              e.stopPropagation();
              if ('children' in cat && Array.isArray(cat.children) && cat.children.length > 0) {
                toggleExpand(cat.id);
              }
            }}>
            {/* سهم التوسيع */}
            {'children' in cat && Array.isArray(cat.children) && cat.children.length > 0 ? (
              <span className={`mr-2 ml-2 text-primary transition-transform duration-200 ${expanded[cat.id] ? (isRTL ? '-rotate-90' : 'rotate-90') : ''}`}>
                {isRTL ? <FiChevronLeft /> : <FiChevronRight />}
              </span>
            ) : (
              <span className="w-5" />
            )}
            {/* صورة الفئة */}
            <img
              src={
                typeof cat.image === 'string' ? cat.image : (cat.image && typeof cat.image === 'object' && (cat.image as any).url ? (cat.image as any).url : '')
              }
              alt={cat.nameAr}
              className={`object-cover border border-primary/20 mr-2 ml-2 rounded-full ${level === 0 ? 'sm:w-16 sm:h-16 w-10 h-10' : 'sm:w-12 sm:h-12 w-8 h-8'}`}
              onError={e => {
                const target = e.currentTarget;
                const fallback = `https://via.placeholder.com/40x40?text=${encodeURIComponent((lang === 'ar' || lang === 'ARABIC' ? cat.nameAr : cat.nameEn).charAt(0))}`;
                if (target.src !== fallback) target.src = fallback;
              }}
            />
            {/* اسم الفئة */}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={`${isRTL ? 'text-right' : 'text-left'} truncate font-bold cursor-pointer hover:underline hover:text-blue-600 transition ${level === 0 ? 'text-lg text-primary' : 'text-base text-gray-700'}`}
                onClick={e => {
                  e.stopPropagation();
                  if (cat.id) {
                    navigate(`/${storeSlug}/products?categoryId=${cat.id}`);
                  }
                }}
                title={lang === 'ar' || lang === 'ARABIC' ? cat.nameAr : cat.nameEn}
              >
                {lang === 'ar' || lang === 'ARABIC' ? cat.nameAr : cat.nameEn}
              </span>
              {(lang === 'ar' || lang === 'ARABIC' ? cat.descriptionAr : cat.descriptionEn) && (
                <span className={`${isRTL ? 'text-right' : 'text-left'} block w-full text-xs mt-0.5 ${level === 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                  {lang === 'ar' || lang === 'ARABIC' ? cat.descriptionAr : cat.descriptionEn}
                </span>
              )}
            </div>
            {/* شارة رئيسية/فرعية */}
            {level === 0 ? (
              <span className={`ml-2 mr-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white hidden sm:inline`}>{isRTL ? 'رئيسية' : 'Main'}</span>
            ) : (
              <span className={`ml-2 mr-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-primary`}>{isRTL ? 'فرعية' : 'Sub'}</span>
            )}
            {/* أزرار الإدارة */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={e => { e.stopPropagation(); onAdd(cat.id); }} className="p-1 rounded-full hover:bg-primary/10 text-primary" title="إضافة فرعية"><FiPlus /></button>
              <button onClick={e => { e.stopPropagation(); onEdit(cat); }} className="p-1 rounded-full hover:bg-blue-100 text-blue-600" title="تعديل"><FiEdit /></button>
              <button onClick={e => { e.stopPropagation(); onDelete(cat); }} className="p-1 rounded-full hover:bg-red-100 text-red-600" title="حذف"><FiTrash2 /></button>
            </div>
          </div>
          {/* الفروع الفرعية */}
          {'children' in cat && Array.isArray(cat.children) && cat.children.length > 0 && expanded[cat.id] && (
            <div className="flex flex-col gap-1 mt-1">
              <CategoryTree
                categories={cat.children}
                isRTL={isRTL}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CategoryTree; 