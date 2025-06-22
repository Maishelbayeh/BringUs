

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
    logoUrl?: string;
    isDefault: boolean;
    titleAr?: string;
    titleEn?: string;
  }

// src/Types.ts
export interface DeliveryArea {
  id: number;
  location?: string;
  locationAr?: string;
  locationEn?: string;
  price: number;
  whatsappNumber: string;
}

export interface DelieveryMethod {
  id: number;
  location?: string;
  locationAr?: string;
  locationEn?: string;
  price: number;
  whatsappNumber: string;
}