import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import { useCustomers, Customer, Order } from '../../hooks/useCustomers';
import * as XLSX from 'xlsx';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomerDetailsPopup from './CustomerDetailsPopup';
import PermissionModal from '../../components/common/PermissionModal';
import { FiTrash2 } from 'react-icons/fi';

const STORE_ID_KEY = 'storeId';
const DEFAULT_STORE_ID = localStorage.getItem(STORE_ID_KEY) || '';

const CustomersPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const [search, setSearch] = useState('');

  // Get storeId from localStorage
  const [storeId, setStoreId] = useState<string>(DEFAULT_STORE_ID);

  // Initialize storeId from localStorage
  useEffect(() => {
    const storedStoreId = localStorage.getItem(STORE_ID_KEY);
    if (storedStoreId) {
      setStoreId(storedStoreId);
    } else {
      localStorage.setItem(STORE_ID_KEY, DEFAULT_STORE_ID);
    }
  }, []);

  // Use the customers hook
  const {
    customers,
    loading,
    error,
    statistics,
    pagination,
    fetchCustomers,
    deleteCustomer,
    fetchCustomerOrders,
  } = useCustomers();

  // State for customer orders
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Filter customers based on search (محليًا)
  const filteredCustomers = customers.filter((customer) => {
    const name = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const address = (customer.addressSummary || '').toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    const searchValue = search.toLowerCase();
    return (
      name.includes(searchValue) ||
      address.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (storeId) {
        fetchCustomers(storeId, false, 1, 10);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchCustomers, storeId]);

  // Fetch customers on mount
  useEffect(() => {
    if (storeId) {
      fetchCustomers(storeId, false);
    }
  }, [storeId, fetchCustomers]);

  const getTotalSpent = (orders: Order[]) =>
    orders.reduce((sum, order) => sum + ( order.totalSpent || 0 ), 0);
  
  const getAverageOrderValue = (orders: Order[]) => {
    if (orders.length === 0) return 0;
    const totalSpent = getTotalSpent(orders);
    return Math.round(totalSpent / orders.length);
  };

  const getLastOrderDate = (orders: Order[]) => {
    if (!orders.length) return '-';
    return orders.reduce((latest, order) => new Date(order.date) > new Date(latest) ? order.date : latest, orders[0].date);
  };

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      // Skip fetching orders for guests (they don't have _id)
      if (customer._id && !customer.isGuest) {
        const orders = await fetchCustomerOrders(customer._id, storeId);
        if (orders) {
          setCustomerOrders(orders);
        }
      } else {
        setCustomerOrders([]);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDelete = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't allow deletion of guests (they don't have _id)
    if (!customer._id || customer.isGuest) {
      return;
    }
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (customerToDelete && storeId && customerToDelete._id) {
      const success = await deleteCustomer(storeId, customerToDelete._id);
      if (success) {
        //CONSOLE.log('Customer deleted successfully');
      }
      setCustomerToDelete(null);
    }
    setShowDeleteModal(false);
  };

  // Filter customers based on search (this is now handled by the API)
  // const filteredCustomers = customers; // This line is removed as per the edit hint.

  const handleDownloadExcel = () => {
    const rows: any[] = [];
    filteredCustomers.forEach((customer) => {
      rows.push({
        [isRTL ? 'الاسم الأول' : 'First Name']: customer.firstName,
        [isRTL ? 'الاسم الأخير' : 'Last Name']: customer.lastName,
        [isRTL ? 'البريد الإلكتروني' : 'Email']: customer.email || '',
        [isRTL ? 'رقم الهاتف' : 'Phone']: customer.phone,
        [isRTL ? 'العنوان' : 'Address']: customer.addressSummary || (isRTL ? 'لا يوجد عنوان' : 'No address'),
        [isRTL ? 'الدور' : 'Role']: customer.role,
        [isRTL ? 'الحالة' : 'Status']: customer.status,
        [isRTL ? 'نوع العميل' : 'Customer Type']: customer.isGuest ? (isRTL ? 'ضيف' : 'Guest') : (isRTL ? 'مسجل' : 'Registered'),
      });
    });
    
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customers.xlsx');
  };

  // Get customer display name
  const getCustomerDisplayName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  // Get customer initials
  const getCustomerInitials = (customer: Customer) => {
    const firstName = customer.firstName || '';
    const lastName = customer.lastName || '';
    const firstInitial = firstName.length > 0 ? firstName[0] : '';
    const lastInitial = lastName.length > 0 ? lastName[0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'GU';
  };

  if (loading && customers.length === 0) {
    return (
      <div className="sm:p-4 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sm:p-4 w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('customers.title') || 'Customers', href: '/customers' }
      ]} isRtl={isRTL} />
      
      <HeaderWithAction
        title={t('customers.title')}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={isRTL ? 'ابحث باسم العميل أو العنوان او رقم الهاتف...' : 'Search by customer name or customer address or customer phone...'}
        onDownload={handleDownloadExcel}
      />

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{statistics.total}</div>
            <div className="text-sm text-gray-600">{isRTL ? 'إجمالي العملاء' : 'Total Customers'}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
            <div className="text-sm text-gray-600">{isRTL ? 'نشط' : 'Active'}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.inactive}</div>
            <div className="text-sm text-gray-600">{isRTL ? 'غير نشط' : 'Inactive'}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{statistics.banned}</div>
            <div className="text-sm text-gray-600">{isRTL ? 'محظور' : 'Banned'}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.emailVerified}</div>
            <div className="text-sm text-gray-600">{isRTL ? 'مؤكد البريد' : 'Email Verified'}</div>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {filteredCustomers.map((customer) => {
          return (
            <div
              key={customer._id || `guest-${customer.email}-${customer.firstName}`}
              className={`border bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex items-center gap-6 group relative cursor-pointer `}
              onClick={() => handleCustomerClick(customer)}
            >
              <div className="relative">
                {(() => {
                  const colors = [
                    'bg-primary/10 text-primary',
                    'bg-blue-100 text-blue-700',
                    'bg-green-100 text-green-700',
                    'bg-yellow-100 text-yellow-700',
                    'bg-pink-100 text-pink-700',
                    'bg-indigo-100 text-indigo-700',
                    'bg-purple-100 text-purple-700',
                    'bg-orange-100 text-orange-700',
                  ];
                  const colorIdx = (customer._id || 'guest').charCodeAt((customer._id || 'guest').length - 1) % colors.length;
                  return (
                    <div className={`h-20 w-20 flex items-center justify-center rounded-full text-3xl font-bold shadow ${colors[colorIdx]}`}>
                      {getCustomerInitials(customer)}
                    </div>
                  );
                })()}
                <span className={`absolute -top-2 ${language === 'ARABIC' ? '-right-2' : '-left-2'} bg-purple-100 text-purple-800 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md border-2 border-white`}>
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1.68 9.39A2 2 0 0 1 15.34 19H8.66a2 2 0 0 1-1.98-1.61L5 8zm2-3a3 3 0 0 1 6 0" />
                  </svg>
                  { customer.orderCount }
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 mb-1 `}> 
                  <h2 className={`text-xl font-bold text-primary truncate ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                    {getCustomerDisplayName(customer)}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
                <p className={`text-gray-500 text-sm truncate ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                  {customer.addressSummary || (isRTL ? 'لا يوجد عنوان' : 'No address')}
                </p>
                <p className={`text-gray-500 text-sm truncate ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>
                  {customer.phone}
                </p>
              </div>
              <button
                className="hidden lg:inline-flex opacity-0 group-hover:opacity-100 transition bg-primary text-white px-4 py-1 rounded-lg text-sm"
                onClick={e => { e.stopPropagation(); setSelectedCustomer(customer); }}
              >
                {t('common.details') || 'Details'}
              </button>
              {/* Delete Button - Only show for registered customers */}
              {!customer.isGuest && customer._id && (
                <button
                  onClick={e => handleDelete(customer, e)}
                  className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 p-2 rounded-full hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  title={t('common.delete') || 'Delete'}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => fetchCustomers(storeId, false, pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRTL ? 'السابق' : 'Previous'}
            </button>
            <span className="px-3 py-2">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchCustomers(storeId, false, pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRTL ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailsPopup
          open={!!selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            setCustomerOrders([]);
          }}
          customer={selectedCustomer}
          orders={customerOrders}
          isRTL={isRTL}
          t={t}
          getLastOrderDate={getLastOrderDate}
          getTotalSpent={getTotalSpent}
          getAverageOrderValue={getAverageOrderValue}
          ordersLoading={ordersLoading}
        />
      )}
      
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('customers.deleteConfirmTitle') || 'Confirm Delete Customer'}
        message={t('customers.deleteConfirmMessage') || 'Are you sure you want to delete this customer?'}
        itemName={customerToDelete ? getCustomerDisplayName(customerToDelete) : ''}
        itemType={t('customers.customer') || 'customer'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default CustomersPage; 