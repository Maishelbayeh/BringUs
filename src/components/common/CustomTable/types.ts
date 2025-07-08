export interface Column {
  key: string;
  label: {
    en: string;
    ar: string;
  };
  type?: 'text' | 'number' | 'date' | 'image' | 'color' | 'link' | 'status';
  render?: (value: any, item: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  hideable?: boolean;
  showControls?: boolean;
}

export interface LinkConfig {
  column: string;
  getPath: (row: any) => string;
}

export interface CustomTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onFilteredDataChange?: (filtered: any[]) => void;
  linkConfig?: LinkConfig[];
  showColumnToggle?: boolean;
  showHiddenColumnsBar?: boolean;
  autoScrollToFirst?: boolean;
  onColumnsChange?: (columns: Column[]) => void;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: string;
}

export interface ImageModalState {
  isOpen: boolean;
  src: string;
  alt: string;
}

export interface ColumnVisibilityState {
  [key: string]: boolean;
} 