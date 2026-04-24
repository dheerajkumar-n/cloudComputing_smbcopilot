import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../../services/api';

function AddSupplierModal({ businessId, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '', category: '', rating: 4, leadTimeDays: 3, minOrderAmount: 50 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await suppliersAPI.createSupplier(businessId, {
        ...form, rating: Number(form.rating), leadTimeDays: Number(form.leadTimeDays), minOrderAmount: Number(form.minOrderAmount)
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
        <h3>🚚 Add Supplier</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input className="form-input" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Hair Care, Dairy..." />
            </div>
            <div className="form-group">
              <label>Rating (1–5)</label>
              <input className="form-input" type="number" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Lead Time (days)</label>
              <input className="form-input" type="number" min="0" value={form.leadTimeDays} onChange={e => setForm({ ...form, leadTimeDays: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Min Order ($)</label>
              <input className="form-input" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Supplier'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? '#F6AD55' : '#E2E8F0', fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

const ORDER_BADGES = {
  pending: 'badge-yellow', approved: 'badge-blue', ordered: 'badge-purple',
  received: 'badge-green', cancelled: 'badge-red'
};

export default function SuppliersModule({ businessId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('suppliers');
  const [comparing, setComparing] = useState(false);

  const load = async () => {
    try {
      const [sups, ords] = await Promise.all([
        suppliersAPI.getSuppliers(businessId),
        suppliersAPI.getOrders(businessId)
      ]);
      setSuppliers(sups);
      setOrders(ords);
    } catch {
      setSuppliers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [businessId]);

  const handleCompare = async () => {
    setComparing(true);
    try {
      const ranked = await suppliersAPI.compareSuppliers(businessId);
      setSuppliers(ranked);
      setView('suppliers');
    } catch {}
    finally { setComparing(false); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await suppliersAPI.updateOrderStatus(id, status);
      load();
    } catch {}
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="module-page">
      {showAdd && <AddSupplierModal businessId={businessId} onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}

      <div className="module-header">
        <div className="module-header-left">
          <h2>🚚 Suppliers & Orders</h2>
          <p>{suppliers.length} suppliers · {pendingCount} pending orders</p>
        </div>
        <div className="btn-group">
          <button className={`btn btn-sm ${view === 'suppliers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('suppliers')}>Suppliers</button>
          <button className={`btn btn-sm ${view === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('orders')}>
            Orders {pendingCount > 0 && <span className="badge badge-yellow" style={{ marginLeft: 4 }}>{pendingCount}</span>}
          </button>
          <button className="btn btn-outline" onClick={handleCompare} disabled={comparing}>
            {comparing ? '...' : '⚖️ Compare'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Supplier</button>
        </div>
      </div>

      {view === 'suppliers' ? (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Supplier Directory</span>
            <span style={{ fontSize: 12, color: '#718096' }}>Sorted by performance score</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : suppliers.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🚚</div><p>No suppliers added</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Company</th><th>Contact</th><th>Category</th><th>Rating</th><th>Lead Time</th><th>Min Order</th></tr>
                </thead>
                <tbody>
                  {suppliers.map((s, idx) => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {idx === 0 && <span style={{ fontSize: 14 }}>🏆</span>}
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            {idx === 0 && <div style={{ fontSize: 11, color: '#48BB78' }}>Best rated</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{s.contactName || '—'}</div>
                        {s.phone && <div style={{ fontSize: 11, color: '#718096' }}>{s.phone}</div>}
                      </td>
                      <td><span className="badge badge-blue">{s.category || '—'}</span></td>
                      <td><StarRating rating={s.rating} /></td>
                      <td>{s.leadTimeDays} day{s.leadTimeDays !== 1 ? 's' : ''}</td>
                      <td>${s.minOrderAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Reorder Requests</span>
            <span style={{ fontSize: 12, color: '#718096' }}>{orders.length} total</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {orders.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><p>No orders yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Est. Cost</th><th>Requested</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>{order.itemName}</td>
                      <td>{order.quantity}</td>
                      <td>${(order.estimatedCost || 0).toFixed(2)}</td>
                      <td>{new Date(order.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td><span className={`badge ${ORDER_BADGES[order.status] || 'badge-gray'}`}>{order.status}</span></td>
                      <td>
                        {order.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-sm btn-primary" onClick={() => updateOrderStatus(order._id, 'ordered')}>Order</button>
                            <button className="btn btn-sm btn-danger" onClick={() => updateOrderStatus(order._id, 'cancelled')}>✕</button>
                          </div>
                        )}
                        {order.status === 'ordered' && (
                          <button className="btn btn-sm btn-success" onClick={() => updateOrderStatus(order._id, 'received')}>Mark Received</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
