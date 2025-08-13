const express = require('express');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Placeholder authentication logic
    // في الإنتاج، يجب التحقق من قاعدة البيانات
    if (email === 'superadmin@gmail.com' && password === 'password') {
      // Super Admin login
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWJhNDRkZGUwNTBkNmVhMzZiYjlkMSIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzU1MDY3ODI0LCJleHAiOjE3NTU2NzI2MjR9.Zx_HrBwkZfBGWRb7OhsBrDBpQN7v2_0plXcbt36-5Eg';
      
      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: '689ba44dde050d6ea36bb9d1',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@gmail.com',
          role: 'superadmin',
          avatar: {
            public_id: null,
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
          },
          store: null,
          stores: [],
          isOwner: false
        },
        storeId: null,
        isOwner: false,
        userStatus: 'active'
      });
    } else if (email === 'admin@gmail.com' && password === 'password') {
      // Admin login
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWJhNDRkZGUwNTBkNmVhMzZiYjlkMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NTA2Nzg0NCwiZXhwIjoxNzU1NjcyNjQ0fQ.example';
      
      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: '689ba44dde050d6ea36bb9d2',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@gmail.com',
          role: 'admin',
          avatar: {
            public_id: null,
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
          },
          store: {
            id: 'store123',
            nameAr: 'متجر تجريبي',
            nameEn: 'Test Store',
            slug: 'test-store',
            status: 'active',
            isPrimaryOwner: true,
            isOwner: true,
            permissions: ['read', 'write'],
            _id: 'store123'
          },
          stores: [],
          isOwner: true
        },
        storeId: 'store123',
        isOwner: true,
        userStatus: 'active'
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router; 