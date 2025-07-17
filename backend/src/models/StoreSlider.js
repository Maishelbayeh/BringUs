const mongoose = require('mongoose');

const storeSliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['slider', 'video'],
    required: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  youtubeId: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  thumbnailUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
storeSliderSchema.index({ store: 1, order: 1 });
storeSliderSchema.index({ store: 1, isActive: 1 });

module.exports = mongoose.model('StoreSlider', storeSliderSchema); 