const Supplier = require('../models/Supplier');
const ReorderRequest = require('../models/ReorderRequest');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ businessId: req.params.businessId }).sort({ rating: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({ ...req.body, businessId: req.params.businessId });
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.compareSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ businessId: req.params.businessId });
    const ranked = suppliers.sort((a, b) => {
      const scoreA = a.rating * 2 - a.leadTimeDays * 0.5;
      const scoreB = b.rating * 2 - b.leadTimeDays * 0.5;
      return scoreB - scoreA;
    });
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await ReorderRequest.find({ businessId: req.params.businessId })
      .sort({ requestedAt: -1 })
      .limit(30);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await ReorderRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
