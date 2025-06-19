import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Divider } from '@mui/material';
interface HeaderWithActionProps {
  title: string;
  addLabel: string;
  onAdd: () => void;
  isRtl?: boolean;
  className?: string;
}

const HeaderWithAction: React.FC<HeaderWithActionProps> = ({ title, addLabel, onAdd, isRtl, className = '' }) => {
  return (
   <> <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <button
        onClick={onAdd}
        className={`flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {isRtl ? (
          <>
            <span>{addLabel}</span>
            <PlusIcon className="h-5 w-5" />
          </>
        ) : (
          <>
            <PlusIcon className="h-5 w-5" />
            <span>{addLabel}</span>
          </>
        )}
      </button>

    
    </div>  <Divider sx={{ mb: { xs: 2, sm: 3 } }} /></>
  );
};

export default HeaderWithAction; 