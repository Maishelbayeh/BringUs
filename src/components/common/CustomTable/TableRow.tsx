import React from 'react';
import { useTranslation } from 'react-i18next';
import { Column, LinkConfig, ImageModalState } from './types';
import TableCell from './TableCell';

interface TableRowProps {
  item: any;
  columns: Column[];
  linkConfig: LinkConfig[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onImageClick: (modal: ImageModalState) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  item,
  columns,
  linkConfig,
  onEdit,
  onDelete,
  onImageClick
}) => {
  const { t } = useTranslation();


  return (
    <tr className="custom-table-row mb-4 bg-white rounded-lg shadow border-0">
      {columns.map(column => (
        <TableCell
          key={column.key}
          column={column}
          item={item}
          linkConfig={linkConfig}
          onImageClick={onImageClick}
        />
      ))}
      
      {(onEdit || onDelete) && (
        <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium">
          <div className="flex justify-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="action-button text-primary hover:text-primary-dark transition-colors p-1 rounded hover:bg-primary/10"
                title={t('common.edit')}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="action-button text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                title={t('common.delete')}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default TableRow; 