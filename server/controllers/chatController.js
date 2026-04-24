const { parseIntent, getNextWeekday } = require('../services/aiService');
const InventoryItem = require('../models/InventoryItem');
const Employee = require('../models/Employee');
const Supplier = require('../models/Supplier');
const ReorderRequest = require('../models/ReorderRequest');
const Shift = require('../models/Shift');
const ChatLog = require('../models/ChatLog');

async function executeIntent(intent, entities, businessId, businessType) {
  switch (intent) {

    case 'check_stock': {
      const items = await InventoryItem.find({ businessId });
      const low = items.filter(i => i.quantity <= i.reorderPoint);
      return {
        type: 'inventory_status', total: items.length, lowStock: low,
        message: low.length > 0
          ? `⚠️ ${low.length} item(s) running low: ${low.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}`
          : `✅ All ${items.length} inventory items are well-stocked.`
      };
    }

    case 'reorder_supplies': {
      const items = await InventoryItem.find({ businessId });
      const low = items.filter(i => i.quantity <= i.reorderPoint);
      if (!low.length) return { type: 'reorder_result', orders: [], message: '✅ No items need reordering right now.' };
      const orders = await Promise.all(low.map(item =>
        ReorderRequest.create({ businessId, itemId: item._id, itemName: item.name, quantity: item.reorderPoint * 2, estimatedCost: item.cost * item.reorderPoint * 2, status: 'pending' })
      ));
      return { type: 'reorder_result', orders, message: `📦 Created ${orders.length} reorder request(s) for: ${low.map(i => i.name).join(', ')}.` };
    }

    case 'add_inventory': {
      const { itemName, quantity, unit } = entities;
      if (!itemName || !quantity) {
        return { type: 'error', message: '❌ Please specify item and quantity. Example: "Add 20kg coffee beans to inventory"' };
      }

      const existing = await InventoryItem.findOne({ businessId, name: { $regex: new RegExp(itemName, 'i') } });

      if (existing) {
        const oldQty = existing.quantity;
        existing.quantity += quantity;
        existing.updatedAt = new Date();
        await existing.save();
        return {
          type: 'stock_updated', item: existing,
          message: `✅ Added ${quantity} ${unit || existing.unit} of ${existing.name}. Stock: ${oldQty} → ${existing.quantity} ${existing.unit}.`
        };
      }

      const newItem = await InventoryItem.create({
        businessId, name: itemName, quantity, unit: unit || 'units',
        reorderPoint: Math.max(1, Math.floor(quantity * 0.2)),
        cost: 0, category: 'General'
      });
      return {
        type: 'item_created', item: newItem,
        message: `✅ Added "${newItem.name}" to inventory — ${quantity} ${newItem.unit}. (Reorder point set to ${newItem.reorderPoint})`
      };
    }

    case 'update_stock': {
      const { itemName, quantity } = entities;
      if (!itemName || quantity === null || quantity === undefined) {
        return { type: 'error', message: '❌ Try: "Set milk quantity to 25"' };
      }
      const item = await InventoryItem.findOne({ businessId, name: { $regex: new RegExp(itemName, 'i') } });
      if (!item) {
        const all = await InventoryItem.find({ businessId }).select('name');
        return { type: 'error', message: `❌ "${itemName}" not found. Items: ${all.map(i => i.name).join(', ')}` };
      }
      const old = item.quantity;
      item.quantity = quantity;
      item.updatedAt = new Date();
      await item.save();
      return {
        type: 'stock_updated', item,
        message: `✅ ${item.name}: ${old} → ${quantity} ${item.unit}.${quantity <= item.reorderPoint ? ' ⚠️ Below reorder point!' : ' ✅ Healthy.'}`
      };
    }

    case 'view_staff': {
      const staff = await Employee.find({ businessId, status: 'active' });
      return {
        type: 'staff_list', staff,
        message: `👥 ${staff.length} active member(s): ${staff.map(s => `${s.name} (${s.role})`).join(', ')}.`
      };
    }

    case 'add_employee': {
      const { employeeName, role, hourlyRate } = entities;
      if (!employeeName) return { type: 'error', message: '❌ Try: "Add Sarah as Cashier"' };
      const exists = await Employee.findOne({ businessId, name: { $regex: new RegExp(employeeName, 'i') } });
      if (exists) {
        if (exists.status === 'inactive') {
          exists.status = 'active';
          if (role) exists.role = role;
          await exists.save();
          return { type: 'employee_created', employee: exists, message: `✅ Reactivated ${exists.name} as ${exists.role}.` };
        }
        return { type: 'error', message: `❌ "${employeeName}" already exists as ${exists.role}.` };
      }
      const employee = await Employee.create({ businessId, name: employeeName, role: role || 'Staff', hourlyRate: hourlyRate || 15, status: 'active' });
      return { type: 'employee_created', employee, message: `✅ Added ${employee.name} as ${employee.role} at $${employee.hourlyRate}/hr.` };
    }

    case 'remove_employee': {
      const { employeeName } = entities;
      if (!employeeName) return { type: 'error', message: '❌ Try: "Remove John Doe"' };
      const employee = await Employee.findOne({ businessId, name: { $regex: new RegExp(employeeName, 'i') } });
      if (!employee) {
        const all = await Employee.find({ businessId }).select('name');
        return { type: 'error', message: `❌ "${employeeName}" not found. Staff: ${all.map(e => e.name).join(', ')}` };
      }
      employee.status = 'inactive';
      await employee.save();
      return { type: 'employee_removed', employee, message: `✅ Removed ${employee.name} from active staff.` };
    }

    case 'create_shift': {
      const { employeeName, day, startTime, endTime } = entities;
      if (!employeeName || !day) return { type: 'error', message: '❌ Try: "Add John on Monday shift from 10am to 2pm"' };

      const employee = await Employee.findOne({ businessId, name: { $regex: new RegExp(employeeName, 'i') } });
      if (!employee) {
        const all = await Employee.find({ businessId }).select('name');
        return { type: 'error', message: `❌ "${employeeName}" not found. Staff: ${all.map(e => e.name).join(', ')}` };
      }

      const shiftDate = getNextWeekday(day);
      const existing = await Shift.findOne({ businessId, employeeId: employee._id, date: shiftDate, type: 'shift' });

      if (existing) {
        existing.startTime = startTime || existing.startTime;
        existing.endTime = endTime || existing.endTime;
        await existing.save();
        return { type: 'shift_created', shift: existing, message: `✅ Updated ${employee.name}'s ${day} shift to ${startTime}–${endTime}.` };
      }

      const shift = await Shift.create({
        businessId, employeeId: employee._id, employeeName: employee.name,
        date: shiftDate, startTime: startTime || '09:00', endTime: endTime || '17:00',
        role: employee.role, type: 'shift', status: 'scheduled'
      });
      return { type: 'shift_created', shift, message: `✅ ${employee.name} scheduled on ${day} from ${startTime || '09:00'} to ${endTime || '17:00'}.` };
    }

    case 'manage_schedule': {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
      const shifts = await Shift.find({ businessId, date: { $gte: today, $lte: nextWeek } }).sort({ date: 1 }).limit(15);
      return { type: 'schedule', shifts, message: `📅 ${shifts.length} shift(s) this week.` };
    }

    case 'view_suppliers': {
      const suppliers = await Supplier.find({ businessId });
      return { type: 'supplier_list', suppliers, message: `🚚 ${suppliers.length} supplier(s): ${suppliers.map(s => `${s.name} ⭐${s.rating}`).join(', ')}.` };
    }

    case 'view_analytics': {
      const [totalItems, lowCount, totalStaff, pendingOrders, totalInventoryCost] = await Promise.all([
        InventoryItem.countDocuments({ businessId }),
        InventoryItem.countDocuments({ businessId, $expr: { $lte: ['$quantity', '$reorderPoint'] } }),
        Employee.countDocuments({ businessId, status: 'active' }),
        ReorderRequest.countDocuments({ businessId, status: 'pending' }),
        InventoryItem.aggregate([{ $match: { businessId: require('mongoose').Types.ObjectId.createFromHexString(businessId) } }, { $group: { _id: null, total: { $sum: { $multiply: ['$cost', '$quantity'] } } } }])
      ]);
      const cost = totalInventoryCost[0]?.total || 0;
      return {
        type: 'analytics', stats: { totalItems, lowCount, totalStaff, pendingOrders, inventoryCost: cost.toFixed(2) },
        message: `📊 ${totalItems} items (${lowCount} low), ${totalStaff} staff, ${pendingOrders} pending orders, inventory value $${cost.toFixed(2)}.`
      };
    }

    default:
      return { type: 'general', message: null };
  }
}

exports.processChat = async (req, res) => {
  const { message, businessType, businessId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  try {
    const parsed = await parseIntent(message, businessType);
    const actionResult = await executeIntent(parsed.intent, parsed.entities || {}, businessId, businessType);
    const finalMessage = actionResult.message || parsed.response ||
      'Try: "Add 20kg coffee beans", "Remove John", "Add Sarah as Manager", "Check low stock"';
    await ChatLog.create({ businessId, message, parsed, response: { ...actionResult, message: finalMessage } });
    res.json({ success: true, parsed, result: { ...actionResult, message: finalMessage } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const logs = await ChatLog.find({ businessId: req.params.businessId }).sort({ timestamp: -1 }).limit(20);
    res.json(logs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
