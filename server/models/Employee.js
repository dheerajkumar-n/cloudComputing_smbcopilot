const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  name: { type: String, required: true },
  role: String,
  email: String,
  phone: String,
  hourlyRate: { type: Number, default: 15 },
  hireDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
