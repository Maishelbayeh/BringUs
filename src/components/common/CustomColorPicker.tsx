import React, { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorVariant {
  id: string;
  colors: string[];
}

interface CustomColorPickerProps {
  label: string;
  name: string;
  value: ColorVariant[];
  onChange: (e: React.ChangeEvent<{ name: string; value: ColorVariant[] }>) => void;
  isRTL?: boolean;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ label, name, value = [], onChange, isRTL }) => {
  
  const [currentColors, setCurrentColors] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  // تحديث currentColors عندما تتغير value
  useEffect(() => {
    if (value.length > 0 && showPicker) {
      console.log('🔍 Updating currentColors from value:', value[0].colors);
      setCurrentColors(value[0].colors);
    }
  }, [value, showPicker]);

  const handleColorAdd = (color: ColorResult) => {
    const hex = color.hex;
    if (!currentColors.includes(hex)) {
      const newColors = [...currentColors, hex];
      setCurrentColors(newColors);
      
      // إضافة اللون مباشرة إلى المصفوفة الحالية
      if (value.length > 0) {
        // إضافة اللون إلى أول مجموعة ألوان موجودة
        const updatedVariants = [...value];
        updatedVariants[0] = {
          ...updatedVariants[0],
          colors: [...updatedVariants[0].colors, hex]
        };
        onChange({ target: { name, value: updatedVariants } } as any);
      } else {
        // إنشاء مجموعة ألوان جديدة
        const newVariant: ColorVariant = {
          id: Date.now().toString(),
          colors: [hex]
        };
        onChange({ target: { name, value: [newVariant] } } as any);
      }
    }
  };

  const handleColorRemove = (indexToRemove: number) => {
    console.log('🔍 handleColorRemove called:', { indexToRemove, currentColors });
    const newColors = currentColors.filter((_, index) => index !== indexToRemove);
    console.log('🔍 New colors after removal:', newColors);
    setCurrentColors(newColors);
    
    // حذف اللون من المصفوفة الحالية
    if (value.length > 0) {
      const updatedVariants = [...value];
      updatedVariants[0] = {
        ...updatedVariants[0],
        colors: newColors // استخدام newColors بدلاً من filter مرة أخرى
      };
      console.log('🔍 Updated variants:', updatedVariants);
      onChange({ target: { name, value: updatedVariants } } as any);
    }
  };

  // const handleVariantAdd = () => {
  //   if (currentColors.length > 0) {
  //     const newVariant: ColorVariant = {
  //       id: Date.now().toString(),
  //       colors: [...currentColors]
  //     };
  //     onChange({ target: { name, value: [...value, newVariant] } } as any);
  //     setCurrentColors([]);
  //     setShowPicker(false);
  //   }
  // };

  const handleVariantRemove = (variantId: string) => {
    const newVariants = value.filter(variant => variant.id !== variantId);
    onChange({ target: { name, value: newVariants } } as any);
  };

  // دالة لحذف لون محدد من مجموعة ألوان موجودة
  const handleColorRemoveFromVariant = (variantId: string, colorIndex: number) => {
    console.log('🔍 handleColorRemoveFromVariant called:', { variantId, colorIndex });
    
    const updatedVariants = value.map(variant => {
      if (variant.id === variantId) {
        const newColors = variant.colors.filter((_, index) => index !== colorIndex);
        // تحديث currentColors إذا كان هذا هو المجموعة المفتوحة في الـ picker
        if (showPicker && currentColors.length > 0 && variant.colors.length === currentColors.length) {
          setCurrentColors(newColors);
        }
        return {
          ...variant,
          colors: newColors
        };
      }
      return variant;
    }).filter(variant => variant.colors.length > 0); // حذف المجموعات الفارغة
    
    onChange({ target: { name, value: updatedVariants } } as any);
  };

  const getCircleDivisionStyle = (colors: string[] = []) => {
    if (!Array.isArray(colors) || colors.length === 0) {
      return { background: '#eee' };
    }

    if (colors.length === 1) {
      return { background: colors[0] };
    }

    if (colors.length === 2) {
      return {
        background: `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)`
      };
    }

    // For more than 2 colors, use conic gradient
    const step = 360 / colors.length;
    const segments = colors.map((color, index) => {
      const start = step * index;
      const end = step * (index + 1);
      return `${color} ${start}deg ${end}deg`;
    }).join(', ');

    return {
      background: `conic-gradient(${segments})`
    };
  };

  return (
    <div className="w-full mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white flex flex-col">
        <label className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {label}
        </label>
        <div className={`flex flex-wrap gap-4 mb-2`}>
          {value.map((variant) => (
            <div key={variant.id} className="relative group">
              <div
                className="w-12 h-12 rounded-full border-4 border-white shadow transition-transform duration-200 group-hover:scale-110 cursor-pointer"
                style={getCircleDivisionStyle(Array.isArray(variant.colors) ? variant.colors : [])}
                onClick={() => {
                  // عند النقر على الدائرة، اعرض الألوان الفردية
                  setCurrentColors(variant.colors);
                  setShowPicker(true);
                }}
                title={isRTL 
                  ? `انقر لتحرير | انقر مرتين لحذف لون (${variant.colors.length} ألوان)` 
                  : `Click to edit | Double click to remove color (${variant.colors.length} colors)`
                }
              />
              
              {/* أزرار حذف الألوان الفردية */}
              {Array.isArray(variant.colors) && variant.colors.length > 1 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {variant.colors.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('Removing color', colorIndex, 'from variant', variant.id);
                        handleColorRemoveFromVariant(variant.id, colorIndex);
                      }}
                      className="w-4 h-4 bg-red-500 border border-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      title={isRTL ? `حذف اللون ${color}` : `Remove color ${color}`}
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              
              {/* زر إضافة لون جديد للمجموعة */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentColors(variant.colors);
                  setShowPicker(true);
                }}
                className="absolute -bottom-1 right-0 w-4 h-4 bg-green-500 border border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600 shadow-sm"
                title={isRTL ? 'إضافة لون جديد' : 'Add new color'}
              >
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              {/* زر حذف المجموعة كاملة */}
              <button
                type="button"
                onClick={() => handleVariantRemove(variant.id)}
                className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} bg-white border border-gray-300 rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm`}
                title={isRTL ? 'حذف المجموعة' : 'Delete Group'}
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setCurrentColors([]);
              setShowPicker(true);
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary transition text-white text-2xl shadow-lg"
            title={isRTL ? 'إضافة مجموعة ألوان جديدة' : 'Add New Color Group'}
          >
            +
          </button>
        </div>
        {showPicker && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => {
              setShowPicker(false);
              setCurrentColors([]);
            }} />
            <div className="bg-white rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4">
             
              <div className="flex flex-wrap gap-2 mb-2">
                {currentColors.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-sm" 
                      style={{ background: color }}
                    />
                    <button
                      type="button"
                      onClick={() => handleColorRemove(idx)}
                      className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} bg-white border border-gray-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-sm`}
                      title={isRTL ? 'حذف' : 'Delete'}
                    >
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mb-2">
                <SketchPicker color="#000" onChangeComplete={handleColorAdd} />
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPicker(false);
                    setCurrentColors([]);
                  }}
                  className="px-4 py-1 rounded bg-primary text-white font-semibold"
                >
                  {isRTL ? 'تم' : 'Done'}
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setShowPicker(false); 
                    setCurrentColors([]); 
                  }}
                  className="px-4 py-1 rounded bg-gray-200 text-primary font-semibold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomColorPicker; 