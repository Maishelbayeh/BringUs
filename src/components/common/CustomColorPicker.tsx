import React, { useState } from 'react';
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

  const handleColorAdd = (color: ColorResult) => {
    const hex = color.hex;
    if (!currentColors.includes(hex)) {
      setCurrentColors([...currentColors, hex]);
    }
  };

  const handleColorRemove = (indexToRemove: number) => {
    setCurrentColors(currentColors.filter((_, index) => index !== indexToRemove));
  };

  const handleVariantAdd = () => {
    if (currentColors.length > 0) {
      const newVariant: ColorVariant = {
        id: Date.now().toString(),
        colors: [...currentColors]
      };
      onChange({ target: { name, value: [...value, newVariant] } } as any);
      setCurrentColors([]);
      setShowPicker(false);
    }
  };

  const handleVariantRemove = (variantId: string) => {
    const newVariants = value.filter(variant => variant.id !== variantId);
    onChange({ target: { name, value: newVariants } } as any);
  };

  const getCircleDivisionStyle = (colors: string[]) => {
    if (colors.length === 1) {
      return { background: colors[0] };
    }

    const step = 100 / colors.length;
    const segments = colors.map((color, index) => {
      const start = step * index;
      const end = step * (index + 1);
      return `${color} ${start}% ${end}%`;
    }).join(', ');

    return {
      background: `conic-gradient(${segments})`
    };
  };

  return (
    <div className="w-full mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white  flex flex-col ">
        <label className={`block mb-2 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {label}
        </label>
        <div className={`flex flex-wrap gap-4 mb-2 `}>
          {value.map((variant) => (
            <div key={variant.id} className="relative group">
              <div
                className="w-12 h-12 rounded-full border-4 border-white shadow transition-transform duration-200 group-hover:scale-110"
                style={{ background: getCircleDivisionStyle(variant.colors).background }}
              />
              <button
                type="button"
                onClick={() => handleVariantRemove(variant.id)}
                className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} bg-white border border-gray-300 rounded-full p-1 opacity-0 group-hover:opacity-100 transition`}
                title={isRTL ? 'حذف' : 'Delete'}
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary transition text-white text-2xl shadow-lg"
            title={isRTL ? 'إضافة لون جديد' : 'Add New Color'}
          >
            +
          </button>
        </div>
        {showPicker && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowPicker(false)} />
            <div className="bg-white rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {currentColors.map((color, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-8 h-8 rounded-full border border-gray-300" style={{ background: color }} />
                    <button
                      type="button"
                      onClick={() => handleColorRemove(idx)}
                      className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} bg-white border border-gray-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition`}
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
                  onClick={handleVariantAdd}
                  className="px-4 py-1 rounded bg-primary text-white font-semibold disabled:opacity-50"
                  disabled={currentColors.length === 0}
                >
                  {isRTL ? 'إضافة' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPicker(false); setCurrentColors([]); }}
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
