const express = require('express');
const router = express.Router();
const StoreSlider = require('../models/StoreSlider');
const auth = require('../middleware/auth');

// Get all store sliders for a specific store
router.get('/', auth, async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    const sliders = await StoreSlider.find({ store: storeId }).sort({ order: 1 });
    res.json({ data: sliders });
  } catch (error) {
    console.error('Error fetching store sliders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single store slider by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const slider = await StoreSlider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }
    res.json({ data: slider });
  } catch (error) {
    console.error('Error fetching store slider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new store slider
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, imageUrl, videoUrl, order, isActive, store } = req.body;

    // Validation
    if (!title || !type || !store) {
      return res.status(400).json({ message: 'Title, type, and store are required' });
    }

    if (type === 'slider' && !imageUrl) {
      return res.status(400).json({ message: 'Image URL is required for slider type' });
    }

    if (type === 'video' && !videoUrl) {
      return res.status(400).json({ message: 'Video URL is required for video type' });
    }

    const slider = new StoreSlider({
      title,
      description,
      type,
      imageUrl,
      videoUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      store,
      views: 0,
      clicks: 0
    });

    const savedSlider = await slider.save();
    res.status(201).json({ data: savedSlider });
  } catch (error) {
    console.error('Error creating store slider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a store slider
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, type, imageUrl, videoUrl, order, isActive } = req.body;

    const slider = await StoreSlider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }

    // Update fields
    if (title !== undefined) slider.title = title;
    if (description !== undefined) slider.description = description;
    if (type !== undefined) slider.type = type;
    if (imageUrl !== undefined) slider.imageUrl = imageUrl;
    if (videoUrl !== undefined) slider.videoUrl = videoUrl;
    if (order !== undefined) slider.order = order;
    if (isActive !== undefined) slider.isActive = isActive;

    const updatedSlider = await slider.save();
    res.json({ data: updatedSlider });
  } catch (error) {
    console.error('Error updating store slider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a store slider
router.delete('/:id', auth, async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    const slider = await StoreSlider.findOneAndDelete({ 
      _id: req.params.id, 
      store: storeId 
    });

    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }

    res.json({ message: 'Store slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting store slider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle active status
router.patch('/:id/toggle-active', auth, async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    const slider = await StoreSlider.findOne({ 
      _id: req.params.id, 
      store: storeId 
    });

    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }

    slider.isActive = !slider.isActive;
    const updatedSlider = await slider.save();

    res.json({ data: updatedSlider });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment views
router.patch('/:id/increment-views', auth, async (req, res) => {
  try {
    const slider = await StoreSlider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }

    slider.views += 1;
    const updatedSlider = await slider.save();

    res.json({ data: updatedSlider });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment clicks
router.patch('/:id/increment-clicks', auth, async (req, res) => {
  try {
    const slider = await StoreSlider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Store slider not found' });
    }

    slider.clicks += 1;
    const updatedSlider = await slider.save();

    res.json({ data: updatedSlider });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 