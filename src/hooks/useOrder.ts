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

export interface CreateOrderData {
  store?: {
    _id: string;
    nameAr: string;
    nameEn: string;
    logo: string;
    contact: any;
  };
  user?: string | null;
  items: Array<{
    product: string;
    quantity: number;
  }>;
  cartItems: Array<{
    product: string;
    quantity: number;
    selectedSpecifications?: any[];
    selectedColors?: any[];
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    district: string;
    country: string;
    zipCode: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    district: string;
    country: string;
    zipCode: string;
  };
  paymentInfo: {
    method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery'|'store';
    paymentMethodId?: string | null;
    status: string;
  };
  shippingInfo: {
    method: string;
    cost: number;
    deliveryMethodId?: string | null;
  };
  notes: {
    customer: string;
  };
  isGift?: boolean;
  giftMessage?: string;
  deliveryArea?: string;
  currency?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface UseOrderResult {
  data: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateOrderPaymentStatus: (orderId: string, paid: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  createOrder: (orderData: CreateOrderData) => Promise<CreateOrderResponse>;
  createGuestOrder: (orderData: CreateOrderData & { guestId: string }) => Promise<CreateOrderResponse>;
  createPOSOrder: (cartItems: any[], store: any, notes?: string) => Promise<CreateOrderResponse>;
  isCreatingOrder: boolean;
}

export function useOrder(storeId: string): UseOrderResult {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

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
      // إذا تم تغيير الدفع إلى مدفوع، تغيير حالة الطلب إلى "تم التوصيل"
      // إذا تم تغيير الدفع إلى غير مدفوع، تغيير حالة الطلب إلى "معلق"
      const newStatus = paid ? 'delivered' : 'pending';
      console.log(`🔄 Updating payment status for order ${orderId}:`, { paid, newStatus });
      
      // تحديث حالة الدفع أولاً
      const paymentResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus: paid ? 'paid' : 'unpaid' }),
      });

      const paymentResult = await paymentResponse.json();
      
      if (paymentResult.success) {
        // ثم تحديث حالة الطلب
        const statusResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        });

        const statusResult = await statusResponse.json();
        
        if (statusResult.success) {
          // Update the local state with both paymentStatus and status
          setData(prevData => 
            prevData.map(order => 
              (order.id === orderId || order.orderNumber === orderId || order._id === orderId)
                ? { 
                    ...order, 
                    paymentStatus: paymentResult.data.paymentStatus,
                    status: statusResult.data.status || newStatus
                  } 
                : order
            )
          );
        } else {
          throw new Error(statusResult.message || 'Failed to update order status');
        }
      } else {
        throw new Error(paymentResult.message || 'Failed to update payment status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // تحديد حالة الدفع بناءً على حالة الطلب
      let newPaymentStatus = 'unpaid';
      
      if (status === 'delivered') {
        // إذا تم تغيير حالة الطلب إلى "تم التوصيل"، جعل الدفع مدفوع
        newPaymentStatus = 'paid';
      } else if (status !== 'delivered') {
        // إذا تم تغيير حالة الطلب إلى أي شيء آخر غير "تم التوصيل"، جعل الدفع غير مدفوع
        newPaymentStatus = 'unpaid';
      }
      
      console.log(`🔄 Updating order status for order ${orderId}:`, { status, newPaymentStatus });
      
      // تحديث حالة الطلب أولاً
      const statusResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      const statusResult = await statusResponse.json();
      
      if (statusResult.success) {
        // ثم تحديث حالة الدفع
        const paymentResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/payment-status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ paymentStatus: newPaymentStatus }),
        });

        const paymentResult = await paymentResponse.json();
        
        if (paymentResult.success) {
          // Update the local state with both status and paymentStatus
          setData(prevData => 
            prevData.map(order => 
              (order.id === orderId || order.orderNumber === orderId || order._id === orderId)
                ? { 
                    ...order, 
                    status: statusResult.data.status || status,
                    paymentStatus: paymentResult.data.paymentStatus || newPaymentStatus
                  } 
                : order
            )
          );
        } else {
          throw new Error(paymentResult.message || 'Failed to update payment status');
        }
      } else {
        throw new Error(statusResult.message || 'Failed to update order status');
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

  // Helper function to create order data for POS
  const createPOSOrderData = (cartItems: any[], store: any, notes?: string): CreateOrderData => {
    // Get user info from localStorage
    const userName = localStorage.getItem('userName') || '';
    const userLastName = localStorage.getItem('userLastName') || '';
    const userPhone = localStorage.getItem('UserPhone') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userId = localStorage.getItem('userId') || null;
    
    // Get store address
    const storeAddress = store?.contact?.address?.street || 'Store Pickup';
    
    return {
      store: {
        _id: store?._id || store?.id,
        nameAr: store?.nameAr || '',
        nameEn: store?.nameEn || '',
        logo: store?.logo || '',
        contact: store?.contact || {}
      },
      user: userId,
      items: cartItems.map(item => {
        let productId = null;
        
        if (item.productId) {
          productId = item.productId;
        } else if (item.product && typeof item.product === 'string') {
          productId = item.product;
        } else if (item.product && typeof item.product === 'object') {
          productId = item.product._id || item.product.id;
        } else if (item._id) {
          productId = item._id;
        }
        
        return {
          product: productId,
          quantity: item.quantity
        };
      }),
      cartItems: cartItems.map(item => ({
        product: item.productId || (item.product && typeof item.product === 'string' ? item.product : item.product?._id || item.product?.id || item._id),
        quantity: item.quantity,
        selectedSpecifications: Array.isArray(item.selectedSpecifications || item.specifications) 
          ? (item.selectedSpecifications || item.specifications || []).map((spec: any) => ({
              specificationId: spec.specificationId || spec.id || spec._id,
              valueId: spec.valueId || spec.id || spec._id,
              title: spec.title || spec.name || '',
              value: spec.value || spec.name || ''
            }))
          : [],
        selectedColors: Array.isArray(item.selectedColors) 
          ? (item.selectedColors || []).map((color: any) => ({
              colorId: color.colorId || color.id || color._id,
              name: color.name || color.title || '',
              value: color.value || color.hex || color.name || ''
            }))
          : []
      })),
      shippingAddress: {
        firstName:  userName,
        lastName: userLastName,
        email: userEmail || `${userName.replace(/\s+/g, '').toLowerCase()}@example.com`,
        phone: userPhone,
        street: storeAddress,
        city: store?.contact?.address?.city || '',
        district: store?.contact?.address?.state || '',
        country: store?.contact?.address?.country || '',
        zipCode: store?.contact?.address?.zipCode || ''
      },
      billingAddress: {
        firstName: userName.split(' ')[0] || userName,
        lastName: userName.split(' ').slice(1).join(' ') || '',
        email: userEmail || `${userName.replace(/\s+/g, '').toLowerCase()}@example.com`,
        phone: userPhone,
        street: storeAddress,
        city: store?.contact?.address?.city || '',
        district: store?.contact?.address?.state || '',
        country: store?.contact?.address?.country || '',
        zipCode: store?.contact?.address?.zipCode || ''
      },
      paymentInfo: {
        method: 'store',
        paymentMethodId: null,
        status: 'delivered'
      },
      shippingInfo: {
        method: 'pickup',
        cost: 0,
        deliveryMethodId: null
      },
      notes: {
        customer: notes || ''
      },
      isGift: false,
      giftMessage: '',
      deliveryArea: undefined,
      currency: store?.settings?.currency || 'ILS'
    };
  };

  const createOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
    setIsCreatingOrder(true);
    setError(null);

    try {
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      // Get auth token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Prepare the order data for the API
      const apiOrderData = {
        ...orderData,
        // Ensure billing address is same as shipping if not provided
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
      };

      console.log('Creating order with data:', apiOrderData);
      console.log('Cart items details:', apiOrderData.cartItems);
      console.log('Selected specifications:', apiOrderData.cartItems[0]?.selectedSpecifications);

      const response = await fetch(`http://localhost:5001/api/orders/store/${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiOrderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      console.log('Order created successfully:', result);
      
      // Refresh orders list after successful creation
      refetch();
      
      return result;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create order';
      setError(errorMessage);
      console.error('Error creating order:', err);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const createGuestOrder = async (orderData: CreateOrderData & { guestId: string }): Promise<CreateOrderResponse> => {
    setIsCreatingOrder(true);
    setError(null);

    try {
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      // Prepare the order data for the API
      const apiOrderData = {
        ...orderData,
        // Ensure billing address is same as shipping if not provided
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
      };

      console.log('Creating guest order with data:', apiOrderData);

      const response = await fetch(`http://localhost:5001/api/orders/store/${storeId}/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiOrderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to create guest order');
      }

      console.log('Guest order created successfully:', result);
      
      // Refresh orders list after successful creation
      refetch();
      
      return result;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create guest order';
      setError(errorMessage);
      console.error('Error creating guest order:', err);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const createPOSOrder = async (cartItems: any[], store: any, notes?: string): Promise<CreateOrderResponse> => {
    const orderData = createPOSOrderData(cartItems, store, notes);
    return await createOrder(orderData);
  };

  const deleteOrder = async (orderId: string) => {
    try {
      console.log(`🗑️ Deleting order ${orderId}`);
      
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove the order from local state
        setData(prevData => 
          prevData.filter(order => 
            !(order.id === orderId || order.orderNumber === orderId || order._id === orderId)
          )
        );
        console.log(`✅ Order ${orderId} deleted successfully`);
      } else {
        throw new Error(result.message || 'Failed to delete order');
      }
    } catch (err: any) {
      console.error(`❌ Failed to delete order ${orderId}:`, err);
      setError(err.message || 'Network error');
      throw err;
    }
  };

  return { 
    data, 
    isLoading, 
    error, 
    refetch, 
    updateOrderPaymentStatus, 
    updateOrderStatus, 
    deleteOrder, 
    createOrder, 
    createGuestOrder, 
    createPOSOrder,
    isCreatingOrder 
  };
} 