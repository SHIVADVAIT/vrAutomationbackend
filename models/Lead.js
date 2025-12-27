const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mostLikelyCountry: {
    type: String,
    required: true
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Verified', 'To Check'],
    required: true
  },
  synced: {
    type: Boolean,
    default: false
  },
  syncedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure idempotency - prevent duplicate names from being synced
leadSchema.index({ name: 1 });

module.exports = mongoose.model('Lead', leadSchema);
