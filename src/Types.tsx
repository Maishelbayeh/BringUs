export interface LogoDimensions {
    width: number | string, 
    height: number | string, 
}

export interface LogInFormValues {
    username: string;
    password: string;
  }
  

 export interface Notification {
    created_at: string;
    id: string;
    is_read: boolean;
    message: string;
    updated_at: string;
    user_id: string;
  }

  export interface MenuItem {
    id: number;
    title: string;
    icon?: React.ElementType;
    path?: string;
    children?: MenuItem[];
  }

  export interface PaymentMethod {
    id: number;
    title: string;
    titleAr?: string;
    titleEn?: string;
    logoUrl?: string;
    isDefault: boolean;
    isActive: boolean;
    description?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    methodType: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'other';
    processingFee?: number;
    minimumAmount?: number;
    maximumAmount?: number;
    supportedCurrencies?: string[];
    createdAt?: string;
    updatedAt?: string;
  }

// src/Types.ts
export interface DeliveryArea {
  _id?: string;
  id?: number; // Keep for backward compatibility
  location?: string;
  locationAr?: string;
  locationEn?: string;
  price: number;
  whatsappNumber: string;
  isActive?: boolean;
  isDefault?: boolean;
  estimatedDays?: number;
  descriptionAr?: string;
  descriptionEn?: string;
  priority?: number;
  store?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DelieveryMethod extends DeliveryArea {
  // This interface now extends DeliveryArea to ensure compatibility
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Toast Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  isVisible: boolean;
}

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}