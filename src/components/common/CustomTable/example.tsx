import { CustomTable } from './index';

// مثال لاستخدام الجدول المحدث
const ExampleTable = () => {
  const columns = [
    {
      key: 'id',
      label: { en: 'ID', ar: 'الرقم' },
      type: 'number' as const,
      align: 'center' as const
    },
    {
      key: 'name',
      label: { en: 'Name', ar: 'الاسم' },
      type: 'text' as const
    },
    {
      key: 'image',
      label: { en: 'Image', ar: 'الصورة' },
      type: 'image' as const
    },
    {
      key: 'price',
      label: { en: 'Price', ar: 'السعر' },
      type: 'number' as const,
      align: 'right' as const
    },
    {
      key: 'status',
      label: { en: 'Status', ar: 'الحالة' },
      type: 'status' as const
    },
    {
      key: 'color',
      label: { en: 'Color', ar: 'اللون' },
      type: 'color' as const
    },
    {
      key: 'createdAt',
      label: { en: 'Created At', ar: 'تاريخ الإنشاء' },
      type: 'date' as const
    },
    {
      key: 'actions',
      label: { en: 'Actions', ar: 'العمليات' },
      type: 'text' as const,
      showControls: false,
      render: (value: any, item: any) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  const data = [
    {
      id: 1,
      name: 'Product 1',
      image: '/product1.jpg',
      price: 100,
      status: 'Active',
      color: '#ff0000',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Product 2',
      image: '/product2.jpg',
      price: 200,
      status: 'Inactive',
      color: ['#00ff00', '#0000ff'],
      createdAt: '2024-01-02'
    },
    {
      id: 3,
      name: 'Product 3',
      image: '/product3.jpg',
      price: 150,
      status: 'Active',
      color: '#ffff00',
      createdAt: '2024-01-03'
    }
  ];

  const handleFilteredDataChange = (filteredData: any[]) => {
    console.log('Filtered data changed:', filteredData);
  };

  const handleColumnsChange = (updatedColumns: any[]) => {
    console.log('Columns changed:', updatedColumns);
  };

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
  };

  const handleDelete = (item: any) => {
    console.log('Delete item:', item);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CustomTable Example</h1>
      
      <CustomTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilteredDataChange={handleFilteredDataChange}
        showColumnToggle={true}
        showHiddenColumnsBar={true}
        autoScrollToFirst={true}
        onColumnsChange={handleColumnsChange}
      />
    </div>
  );
};

export default ExampleTable; 