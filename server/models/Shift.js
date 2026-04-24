const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employeeName: String,
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  role: String,
  type: { type: String, enum: ['shift', 'appointment'], default: 'shift' },
  customerName: String,
  service: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  notes: String
});

module.exports = mongoose.model('Shift', ShiftSchema);
