import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';

function AddItemModal({ businessId, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', category: '', quantity: '', reorderPoint: '', unit: 'units', cost: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryAPI.createItem(businessId, {
        ...form, quantity: Number(form.quantity), reorderPoint: Number(form.reorderPoint), cost: Number(form.cost)
      });
      onSave();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-modal-overlay">
      <div className="form-modal">
        <h3>➕ Add Inventory Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Shampoo" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Hair Care" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input className="form-input" type="number" required min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="bottles / kg / pieces" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Reorder Point</label>
              <input className="form-input" type="number" required min="0" value={form.reorderPoint} onChange={e => setForm({ ...form, reorderPoint: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryModule({ businessId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderMsg, setReorderMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await inventoryAPI.getItems(businessId);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [businessId]);

  const handleReorder = async () => {
    setReordering(true);
    setReorderMsg('');
    try {
      const res = await inventoryAPI.reorderLowStock(businessId);
      setReorderMsg(res.message);
    } catch {
      setReorderMsg('Failed to create reorder requests.');
    } finally {
      setReordering(false);
    }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await inventoryAPI.updateItem(id, { [field]: Number(value) });
      setItems(prev => prev.map(i => i._id === id ? { ...i, [field]: Number(value), isLowStock: Number(value) <= i.reorderPoint } : i));
    } catch {}
  };

  const lowCount = items.filter(i => i.isLowStock).length;

  const displayed = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchSearch && item.isLowStock;
    if (filter === 'ok') return matchSearch && !item.isLowStock;
    return matchSearch;
  });

  const getStockPercent = (qty, reorder) => Math.min(100, Math.round((qty / Math.max(reorder * 3, 1)) * 100));
  const getBarColor = (qty, reorder) => qty <= reorder ? '#FC8181' : qty <= reorder * 1.5 ? '#F6AD55' : '#68D391';

  return (
    <div className="module-page">
      {showAdd && <AddItemModal businessId={businessId} onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}

      <div className="module-header">
        <div className="module-header-left">
          <h2>📦 Inventory Management</h2>
          <p>{items.length} total items · {lowCount > 0 ? `⚠️ ${lowCount} low stock` : '✅ All stocked'}</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline" onClick={handleReorder} disabled={reordering}>
            {reordering ? '...' : '🔄 Auto Reorder Low Stock'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Item</button>
        </div>
      </div>

      {reorderMsg && (
        <div className="chat-action-card" style={{ marginBottom: 16, background: '#F0FFF4', borderColor: '#9AE6B4' }}>
          <strong>✅ {reorderMsg}</strong>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'low', 'ok'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All Items' : f === 'low' ? `⚠️ Low (${lowCount})` : '✅ OK'}
              </button>
            ))}
          </div>
          <input className="form-input" style={{ width: 220, padding: '6px 10px' }} placeholder="🔍 Search items..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : displayed.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📭</div><p>No items found</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Stock Level</th>
                  <th>Reorder At</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(item => {
                  const pct = getStockPercent(item.quantity, item.reorderPoint);
                  const barColor = getBarColor(item.quantity, item.reorderPoint);
                  return (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600 }}>
                        {item.isLowStock && <span className="low-stock-dot" />}
                        {item.name}
                      </td>
                      <td><span className="badge badge-gray">{item.category || '—'}</span></td>
                      <td>
                        <input
                          style={{ width: 60, padding: '2px 6px', border: '1px solid #E2E8F0', borderRadius: 4, textAlign: 'center' }}
                          type="number" defaultValue={item.quantity} min="0"
                          onBlur={e => { if (Number(e.target.value) !== item.quantity) handleUpdate(item._id, 'quantity', e.target.value); }}
                        /> {item.unit}
                      </td>
                      <td style={{ minWidth: 100 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#718096' }}>{pct}%</span>
                      </td>
                      <td>{item.reorderPoint} {item.unit}</td>
                      <td>${(item.cost || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${item.isLowStock ? 'badge-red' : 'badge-green'}`}>
                          {item.isLowStock ? '⚠️ Low' : '✅ OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
