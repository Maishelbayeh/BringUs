import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FiTrash2 } from 'react-icons/fi';
import { t } from 'i18next';
//-------------------------------------------- ProductCardProps -------------------------------------------
interface ProductCardProps {
  product: any;
  isRTL: boolean;
  onClick: (product: any) => void;
  onDelete: (product: any) => void;
  getCategoryName: (catId: number) => string;
  getLabelName: (label: number | string) => string;
}
//-------------------------------------------- ProductCard -------------------------------------------
const ProductCard: React.FC<ProductCardProps> = ({ product, isRTL, onClick, onDelete, getCategoryName, getLabelName }) => {
  const isDisabled = product.visibility !== true;
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product);
  };
  
  //-------------------------------------------- return -------------------------------------------
  return (
    <div
      className={`rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col group cursor-pointer border-2 relative ${isDisabled ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 pointer-events-auto' : 'bg-white text-primary border-white'}`}
      onClick={() => onClick(product)}
      style={isDisabled ? { filter: 'grayscale(1)', pointerEvents: 'auto' } : {}}
    >
      {/* Delete Button */}
      <button 
        onClick={handleDeleteClick}
        className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 p-2 rounded-full hover:bg-red-100 text-red-600 bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        title={t('general.delete') || 'Delete'}
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
      
      <div className="relative">
        {/* ------------------------------------------- Product Label ------------------------------------------- */}
        <span
          className={`
            absolute top-10 ${isRTL ? 'right-2' : 'left-2'}
            px-3 py-1 rounded-full text-xs font-bold shadow
            ${product.productLabel == 2 ? 'bg-pink-500 text-white' :
              product.productLabel == 3 ? 'bg-yellow-500 text-white' :
              product.productLabel == 4 ? 'bg-green-600 text-white' :
              'bg-gray-300 text-gray-700'}
          `}
          style={{ zIndex: 2 }}
        >
          {getLabelName(product.productLabel)}
        </span>
        {/* ------------------------------------------- Product Image ------------------------------------------- */}
        <img
          src={product.image || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="h-40 w-full object-cover rounded-xl"
        />
        {/* ------------------------------------------- Product Category ------------------------------------------- */}
        <span className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} bg-primary text-white text-xs px-3 py-1 rounded-full shadow`}>
          {getCategoryName(product.categoryId)}
        </span>
      </div>
      {/* ------------------------------------------- Product Name ------------------------------------------- */}
      <h2 className={`text-xl font-bold mt-3 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? product.nameAr : product.nameEn}</h2>
      {/* Description under product name */}
      <p className={` border-b pb-1 border-gray-200 text-xs text-gray-500 mt-1 mb-1 ${isRTL ? 'text-right' : 'text-left'}`} style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        {isRTL ? product.descriptionAr : product.descriptionEn}
      </p>
      {/* ------------------------------------------- Colors ------------------------------------------- */}
      {Array.isArray(product.colors) && product.colors.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-2 mb-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          {product.colors.map((colorArr: string[], idx: number) => {
            let style = {};
            if (Array.isArray(colorArr) && colorArr.length > 1) {
              const step = 100 / colorArr.length;
              const segments = colorArr.map((color, i) => {
                const start = step * i;
                const end = step * (i + 1);
                return `${color} ${start}% ${end}%`;
              }).join(', ');
              style = { background: `conic-gradient(${segments})` };
            } else {
              style = { background: colorArr[0] };
            }
            return (
              <span
                key={colorArr.join('-') + idx}
                className="inline-block w-5 h-5 rounded-full border border-gray-300"
                style={style}
                title={colorArr.join(', ')}
              />
            );
          })}
        </div>
      )}
      {/* ------------------------------------------- Price and Availability ------------------------------------------- */}
      <div className={`justify-between flex  gap-2 mt-2 flex-col ${isRTL ? 'items-end' : 'items-start'} `}>
        <span className={`text-lg font-bold text-green-600 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {product.price ? product.price : '-'}
          <span className="text-xs text-gray-500">ILS</span>
        </span>
        <span className={`w-fit ${isRTL ? 'flex-row-reverse' : 'flex-row'} px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1
          ${Number(product.availableQuantity) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
        >
          {Number(product.availableQuantity) > 0 ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-gray-400" />
          )}
          {Number(product.availableQuantity) > 0 ? `${product.availableQuantity}  ${t('products.available')}` :  t('products.notAvailable')}
        </span>
      </div>
    </div>
  );
};

export default ProductCard; 