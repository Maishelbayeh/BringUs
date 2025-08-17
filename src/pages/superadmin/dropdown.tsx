
import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  isRTL?: boolean;
}

const CustomSelect: React.FC<SelectProps> = ({ options, isRTL = false, ...props }) => {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                   focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                   dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                   dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                   ${isRTL ? 'text-right pr-3 pl-10' : 'text-left pl-3 pr-10'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom arrow positioned based on RTL */}
      <div className={`pointer-events-none absolute inset-y-0 flex items-center ${
        isRTL ? 'left-3' : 'right-3'
      }`}>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default CustomSelect;

