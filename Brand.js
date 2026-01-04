const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  description: String,
  embedding: [Number], // This is what your Atlas Vector Index looks at
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', BrandSchema);