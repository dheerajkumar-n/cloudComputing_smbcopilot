const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  name: { type: String, required: true },
  contactName: String,
  email: String,
  phone: String,
  category: String,
  rating: { type: Number, min: 1, max: 5, default: 4 },
  leadTimeDays: { type: Number, default: 3 },
  minOrderAmount: { type: Number, default: 50 },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
