const mongoose = require('mongoose');

const BusinessProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessType: {
    type: String,
    enum: ['Salon', 'Store', 'Boutique', 'Laundromat', 'Cafe', 'ServiceShop'],
    required: true
  },
  ownerName: String,
  address: String,
  phone: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessProfile', BusinessProfileSchema);
