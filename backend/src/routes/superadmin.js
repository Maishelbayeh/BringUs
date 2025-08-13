const express = require('express');
const router = express.Router();

// Middleware للتحقق من دور السوبر أدمن
const requireSuperAdmin = (req, res, next) => {
  // هنا يجب إضافة التحقق من التوكن ودور السوبر أدمن
  // للآن سنستخدم placeholder
  next();
};

// جلب جميع المتاجر
router.get('/stores', requireSuperAdmin, async (req, res) => {
  try {
    // Placeholder data - يجب استبدالها بجلب البيانات من قاعدة البيانات
    const stores = [
      {
        _id: '1',
        nameAr: 'متجر تجريبي 1',
        nameEn: 'Test Store 1',
        descriptionAr: 'وصف المتجر التجريبي الأول',
        descriptionEn: 'Description of the first test store',
        logo: {
          public_id: null,
          url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
        },
        slug: 'test-store-1',
        status: 'active',
        settings: {
          currency: 'ILS',
          mainColor: '#3B82F6',
          language: 'ARABIC',
          storeDiscount: 0,
          timezone: 'Asia/Jerusalem',
          taxRate: 0,
          shippingEnabled: true,
          storeSocials: {}
        },
        whatsappNumber: '+970501234567',
        contact: {
          email: 'store1@example.com',
          phone: '+970501234567',
          address: {
            street: 'شارع تجريبي',
            city: 'رام الله',
            state: 'الضفة الغربية',
            zipCode: '00000',
            country: 'فلسطين'
          }
        },
        owners: [
          {
            _id: '1',
            userId: {
              _id: '1',
              firstName: 'أحمد',
              lastName: 'محمد',
              email: 'ahmed@example.com',
              phone: '+970501234567',
              status: 'active',
              isActive: true
            },
            status: 'active',
            permissions: ['read', 'write'],
            isPrimaryOwner: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        nameAr: 'متجر تجريبي 2',
        nameEn: 'Test Store 2',
        descriptionAr: 'وصف المتجر التجريبي الثاني',
        descriptionEn: 'Description of the second test store',
        logo: {
          public_id: null,
          url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
        },
        slug: 'test-store-2',
        status: 'inactive',
        settings: {
          currency: 'ILS',
          mainColor: '#10B981',
          language: 'ENGLISH',
          storeDiscount: 5,
          timezone: 'Asia/Jerusalem',
          taxRate: 2,
          shippingEnabled: false,
          storeSocials: {}
        },
        whatsappNumber: '+970509876543',
        contact: {
          email: 'store2@example.com',
          phone: '+970509876543',
          address: {
            street: 'Test Street',
            city: 'Bethlehem',
            state: 'West Bank',
            zipCode: '00000',
            country: 'Palestine'
          }
        },
        owners: [
          {
            _id: '2',
            userId: {
              _id: '2',
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah@example.com',
              phone: '+970509876543',
              status: 'active',
              isActive: true
            },
            status: 'active',
            permissions: ['read', 'write'],
            isPrimaryOwner: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: stores,
      count: stores.length
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// تحديث حالة المتجر
router.patch('/stores/:storeId/status', requireSuperAdmin, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "active" or "inactive"'
      });
    }

    // Placeholder - يجب استبدالها بتحديث البيانات في قاعدة البيانات
    console.log(`Updating store ${storeId} status to ${status}`);

    res.json({
      success: true,
      message: `Store status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating store status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 