import React, { useState } from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface CustomShuttleProps {
  label: string;
  name: string;
  value: string[];
  options: Option[];
  onChange: (e: React.ChangeEvent<{ name: string; value: string[] }>) => void;
  isRTL?: boolean;
}

const CustomShuttle: React.FC<CustomShuttleProps> = ({ label, name, value, options, onChange, isRTL }) => {
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);

  const leftOptions = options.filter(opt => !value.includes(opt.value));
  const rightOptions = options.filter(opt => value.includes(opt.value));

  // نقل من اليسار لليمين (إضافة)
  const handleMoveRight = () => {
    const newValue = [...value, ...selectedLeft];
    onChange({ target: { name, value: newValue } } as any);
    setSelectedLeft([]);
  };
  // نقل من اليمين لليسار (إزالة)
  const handleMoveLeft = () => {
    const newValue = value.filter(v => !selectedRight.includes(v));
    onChange({ target: { name, value: newValue } } as any);
    setSelectedRight([]);
  };
  // نقل الكل يمين
  const handleMoveAllRight = () => {
    const newValue = [...value, ...leftOptions.map(opt => opt.value)];
    onChange({ target: { name, value: newValue } } as any);
    setSelectedLeft([]);
  };
  // نقل الكل يسار
  const handleMoveAllLeft = () => {
    onChange({ target: { name, value: [] } } as any);
    setSelectedRight([]);
  };

  // أيقونات
  const SingleArrowIcon = isRTL ? (props: any) => <ChevronLeftIcon className="w-5 h-5" {...props} /> : (props: any) => <ChevronRightIcon className="w-5 h-5" {...props} />;
  const SingleArrowBackIcon = isRTL ? (props: any) => <ChevronRightIcon className="w-5 h-5" {...props} /> : (props: any) => <ChevronLeftIcon className="w-5 h-5" {...props} />;
  const DoubleArrowIcon = (props: any) => (
    <span className="flex items-center">
      {isRTL ? <ChevronLeftIcon className="w-5 h-5 -mr-0.5" {...props} /> : <ChevronRightIcon className="w-5 h-5 -ml-0.5" {...props} />}
      {isRTL ? <ChevronLeftIcon className="w-5 h-5" {...props} /> : <ChevronRightIcon className="w-5 h-5" {...props} />}
    </span>
  );
  const DoubleArrowBackIcon = (props: any) => (
    <span className="flex items-center">
      {isRTL ? <ChevronRightIcon className="w-5 h-5 -mr-0.5" {...props} /> : <ChevronLeftIcon className="w-5 h-5 -ml-0.5" {...props} />}
      {isRTL ? <ChevronRightIcon className="w-5 h-5" {...props} /> : <ChevronLeftIcon className="w-5 h-5" {...props} />}
    </span>
  );

  type ShuttleColumn = {
    options: Option[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    label: string;
  };
  const columns: (ShuttleColumn | 'controls')[] = isRTL
    ? [
        { options: leftOptions, selected: selectedLeft, setSelected: setSelectedLeft, label: 'available' },
        'controls',
        { options: rightOptions, selected: selectedRight, setSelected: setSelectedRight, label: 'selected' },
      ]
    : [
        { options: leftOptions, selected: selectedLeft, setSelected: setSelectedLeft, label: 'available' },
        'controls',
        { options: rightOptions, selected: selectedRight, setSelected: setSelectedRight, label: 'selected' },
      ];

  return (
    <div className="w-full mb-4">
      <div className="w-full mb-1">
        <label className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{label}</label>
      </div>
      <div className={`flex gap-2 `}>
        {/* الأعمدة */}
        {columns.map((col, idx) => {
          if (col === 'controls') {
            return (
              <div key={idx} className="flex flex-col items-center justify-center gap-2 px-1">
                {/* نقل الكل يمين */}
                <button
                  type="button"
                  onClick={handleMoveAllRight}
                  disabled={leftOptions.length === 0}
                  className={`flex items-center justify-center rounded-full w-7 h-7 transition text-primary ${leftOptions.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 hover:scale-110'} bg-transparent`}
                  tabIndex={-1}
                >
                  <DoubleArrowIcon style={{ color: '#634C9F', transform: isRTL ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {/* نقل فردي يمين */}
                <button
                  type="button"
                  onClick={handleMoveRight}
                  disabled={selectedLeft.length === 0}
                  className={`flex items-center justify-center rounded-full w-7 h-7 transition text-primary ${selectedLeft.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-primary/10 hover:bg-primary/20 hover:scale-110'} `}
                  tabIndex={-1}
                >
                  <SingleArrowIcon style={{ color: selectedLeft.length > 0 ? '#3B2565' : '#cbd5e1' }} />
                </button>
                {/* نقل فردي يسار */}
                <button
                  type="button"
                  onClick={handleMoveLeft}
                  disabled={selectedRight.length === 0}
                  className={`flex items-center justify-center rounded-full w-7 h-7 transition text-primary ${selectedRight.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-primary/10 hover:bg-primary/20 hover:scale-110'} `}
                  tabIndex={-1}
                >
                  <SingleArrowBackIcon style={{ color: selectedRight.length > 0 ? '#3B2565' : '#cbd5e1' }} />
                </button>
                {/* نقل الكل يسار */}
                <button
                  type="button"
                  onClick={handleMoveAllLeft}
                  disabled={rightOptions.length === 0}
                  className={`flex items-center justify-center rounded-full w-7 h-7 transition text-primary ${rightOptions.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10 hover:scale-110'} bg-transparent`}
                  tabIndex={-1}
                >
                  <DoubleArrowBackIcon style={{ color: '#634C9F', transform: isRTL ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
              </div>
            );
          }
          // type guard
          const column = col as ShuttleColumn;
          return (
            <ul
              key={column.label}
              className="w-[45%] bg-[#faf9fd] border border-[#ede8f7] rounded-xl shadow h-[300px] overflow-auto flex flex-col gap-1 p-2"
            >
              {column.options.map((opt: Option) => (
                <li
                  key={opt.value}
                  className={`rounded-lg px-3 py-2 cursor-pointer select-none transition text-sm font-medium
                    ${column.selected.includes(opt.value)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-primary/5 text-gray-700'}
                  `}
                  onClick={() =>
                    column.setSelected((sel: string[]) =>
                      sel.includes(opt.value)
                        ? sel.filter((v: string) => v !== opt.value)
                        : [...sel, opt.value]
                    )
                  }
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </div>
  );
};

export default CustomShuttle; 