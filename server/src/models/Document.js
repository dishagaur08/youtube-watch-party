const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  rawText: {
    type: String,
  },
  chunks: [{
    chunkIndex: Number,
    content: String,
    pageNumber: Number,
    embedding: [Number],
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
