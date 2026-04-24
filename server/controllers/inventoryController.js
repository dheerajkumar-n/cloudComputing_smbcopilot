const InventoryItem = require('../models/InventoryItem');
const ReorderRequest = require('../models/ReorderRequest');

exports.getItems = async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await InventoryItem.find({ businessId }).sort({ category: 1, name: 1 });
    const withStatus = items.map(item => ({
      ...item.toObject(),
      isLowStock: item.quantity <= item.reorderPoint
    }));
    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await InventoryItem.find({ businessId });
    const low = items.filter(i => i.quantity <= i.reorderPoint);
    res.json(low);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create({ ...req.body, businessId: req.params.businessId });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderLowStock = async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await InventoryItem.find({ businessId });
    const lowItems = items.filter(i => i.quantity <= i.reorderPoint);

    if (lowItems.length === 0) {
      return res.json({ message: 'All items are well-stocked. No reorders needed.', orders: [] });
    }

    const orders = await Promise.all(
      lowItems.map(item =>
        ReorderRequest.create({
          businessId,
          itemId: item._id,
          itemName: item.name,
          quantity: item.reorderPoint * 2,
          estimatedCost: item.cost * item.reorderPoint * 2,
          status: 'pending'
        })
      )
    );

    res.json({ message: `Created ${orders.length} reorder requests.`, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReorderRequests = async (req, res) => {
  try {
    const orders = await ReorderRequest.find({ businessId: req.params.businessId })
      .sort({ requestedAt: -1 })
      .limit(20);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
