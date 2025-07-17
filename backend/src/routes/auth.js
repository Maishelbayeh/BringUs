const express = require('express');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // This is a placeholder - you'll need to implement actual authentication
    const { email, password } = req.body;
    
    if (email && password) {
      // Generate a simple token for testing
      const token = 'test-token-' + Date.now();
      res.json({ token, user: { email } });
    } else {
      res.status(400).json({ message: 'Email and password are required' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 