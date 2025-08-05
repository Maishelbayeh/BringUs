import { useEffect, useState } from 'react';

export interface DeliveryArea {
  locationAr: string;
  locationEn: string;
  price: number;
  estimatedDays: number;
  whatsappNumber?: string;
  isActive?: boolean;
  isDefault?: boolean;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  priority?: number;
}

export interface OrderItem {
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  storeName: string;
  storePhone: string;
  storeUrl: string;
  customer: string;
  customerPhone: string;
  customerEmail?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  affiliate: string;
  deliveryArea?: DeliveryArea;
  currency: string;
  date: string;
  paid: boolean;
  status: string;
  itemsCount: number;
  notes: string;
  items: OrderItem[];
}

export interface UseOrderResult {
  data: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrder(storeId: string): UseOrderResult {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);
    fetch(`http://localhost:5001/api/orders/store/687c9bb0a7b3f2a0831c4675`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data || []);
        } else {
          setError(result.message || 'Unknown error');
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Network error');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (storeId) fetchOrders();
    // eslint-disable-next-line
  }, [storeId, reloadFlag]);

  const refetch = () => setReloadFlag(f => f + 1);

  return { data, isLoading, error, refetch };
} 