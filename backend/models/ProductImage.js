const mongoose = require('mongoose');

// Images uploaded from the dashboard. Kept in their own collection so product
// queries never load image bytes; products just store the "/api/images/<id>" link.
const ProductImageSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
  size: { type: Number, required: true },
  width: { type: Number },
  height: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ProductImage', ProductImageSchema);
