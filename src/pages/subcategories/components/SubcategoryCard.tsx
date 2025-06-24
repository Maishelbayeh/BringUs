import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface SubcategoryCardProps {
  sub: {
    id: number;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    image: string;
  };
  isRTL: boolean;
  onEdit: (sub: any) => void;
  onDelete: (sub: any) => void;
  onClick: (sub: any) => void;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ sub, isRTL, onEdit, onDelete, onClick }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  return (
    <div
      className={`group flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer bg-gradient-to-l from-primary/5 via-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition ring-1 ring-primary/10 hover:ring-primary/30 p-4 min-h-[120px] relative ${isRTL ? 'sm:flex-row-reverse' : ''} w-full `}
      onClick={() => onClick(sub)}
    >
      <div className="flex-shrink-0 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shadow-md overflow-hidden">
          <img
            src={sub.image}
            alt={currentLanguage === 'ARABIC' ? sub.nameAr : sub.nameEn}
            className="h-16 w-16 object-cover rounded-full transition group-hover:scale-105 duration-300"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-start justify-center gap-1 px-2">
        <h2 className={`text-xl font-bold text-primary mb-1 truncate w-full ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>{currentLanguage === 'ARABIC' ? sub.nameAr : sub.nameEn}</h2>
        <p className={`w-full text-gray-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>{currentLanguage === 'ARABIC' ? sub.descriptionAr : sub.descriptionEn}</p>
      </div>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} sm:ml-2`} onClick={e => e.stopPropagation()}>
        <button
          title="Edit"
          className="flex items-center justify-center bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-full w-10 h-10 shadow transition-all duration-150"
          onClick={() => onEdit(sub)}
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button
          title="Delete"
          className="flex items-center justify-center bg-white border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-full w-10 h-10 shadow transition-all duration-150"
          onClick={() => onDelete(sub)}
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
        <span className={`flex items-center justify-center bg-primary text-white rounded-full w-10 h-10 shadow-lg transition-all duration-200 group-hover:scale-110 ${isRTL ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </span>
      </div>
    </div>
  );
};

export default SubcategoryCard;
