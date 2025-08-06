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
  _id?: string;
  id: string; // This is orderNumber from the API
  orderNumber?: string; // Alternative field name
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
  paymentStatus?: string; // API field: 'paid', 'unpaid' - may be derived from 'paid' field
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
  updateOrderPaymentStatus: (orderId: string, paid: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

export function useOrder(storeId: string): UseOrderResult {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);
    fetch(`http://localhost:5001/api/orders/store/${storeId}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(result => {
        console.log('API Response:', result); // Debug log
        if (result.success) {
          // Map the API response to use paymentStatus consistently
          const mappedData = (result.data || []).map((order: any) => {
            console.log('Order data:', order); // Debug log for each order
            return {
              ...order,
              paymentStatus: order.paymentStatus || (order.paid === true ? 'paid' : 'unpaid')
            };
          });
          console.log('Mapped data:', mappedData); // Debug log
          setData(mappedData);
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

  const updateOrderPaymentStatus = async (orderId: string, paid: boolean) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus: paid ? 'paid' : 'unpaid' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the local state with paymentStatus
        setData(prevData => 
          prevData.map(order => 
            (order.id === orderId || order.orderNumber === orderId || order._id === orderId)
              ? { 
                  ...order, 
                  paymentStatus: result.data.paymentStatus
                } 
              : order
          )
        );
      } else {
        throw new Error(result.message || 'Failed to update payment status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the local state
        setData(prevData => 
          prevData.map(order => 
            (order.id === orderId || order.orderNumber === orderId || order._id === orderId)
              ? { ...order, status } 
              : order
          )
        );
      } else {
        throw new Error(result.message || 'Failed to update order status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      throw err;
    }
  };

  useEffect(() => {
    if (storeId) fetchOrders();
    // eslint-disable-next-line
  }, [storeId, reloadFlag]);

  const refetch = () => setReloadFlag(f => f + 1);

  return { data, isLoading, error, refetch, updateOrderPaymentStatus, updateOrderStatus };
} 