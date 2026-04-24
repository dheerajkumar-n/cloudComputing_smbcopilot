const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  name: { type: String, required: true },
  category: String,
  quantity: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 5 },
  unit: { type: String, default: 'units' },
  cost: { type: Number, default: 0 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  lastRestocked: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InventoryItemSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderPoint;
});

InventoryItemSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
