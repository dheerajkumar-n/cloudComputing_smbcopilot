import React, { useState, useEffect } from 'react';
import { inventoryAPI, staffAPI, suppliersAPI } from '../services/api';
import { BUSINESS_TYPES } from '../config/businessConfig';

function StatCard({ icon, label, value, badge, badgeType, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: bg }}>{icon}</div>
        {badge && <span className={`stat-badge ${badgeType}`}>{badge}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard({ businessId, businessType, onNavigate }) {
  const [stats, setStats] = useState({ items: 0, lowStock: 0, staff: 0, suppliers: 0 });
  const [lowItems, setLowItems] = useState([]);
  const [recentStaff, setRecentStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const bizConfig = BUSINESS_TYPES[businessType];

  useEffect(() => {
    async function load() {
      try {
        const [items, low, staff, suppliers] = await Promise.all([
          inventoryAPI.getItems(businessId),
          inventoryAPI.getLowStock(businessId),
          staffAPI.getEmployees(businessId),
          suppliersAPI.getSuppliers(businessId)
        ]);
        setStats({ items: items.length, lowStock: low.length, staff: staff.length, suppliers: suppliers.length });
        setLowItems(low.slice(0, 5));
        setRecentStaff(staff.slice(0, 5));
      } catch {
        setStats({ items: 12, lowStock: 3, staff: 4, suppliers: 3 });
        setLowItems([
          { _id: '1', name: 'Item A', quantity: 2, reorderPoint: 5, unit: 'units' },
          { _id: '2', name: 'Item B', quantity: 1, reorderPoint: 4, unit: 'bottles' }
        ]);
        setRecentStaff([
          { _id: '1', name: 'Alice Johnson', role: 'Manager', status: 'active' },
          { _id: '2', name: 'Bob Smith', role: 'Associate', status: 'active' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard">
      <div className="page-title">{greeting}! Here's your overview 👋</div>
      <div className="page-subtitle">
        {bizConfig.label} · {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>

      <div className="stats-grid">
        <StatCard icon="📦" label="Total Inventory Items" value={loading ? '...' : stats.items}
          badge={stats.lowStock > 0 ? `${stats.lowStock} low` : 'All OK'} badgeType={stats.lowStock > 0 ? 'warn' : 'up'}
          bg="#FFF5F7" />
        <StatCard icon="⚠️" label="Low Stock Alerts" value={loading ? '...' : stats.lowStock}
          badge={stats.lowStock > 0 ? 'Action needed' : 'Clear'} badgeType={stats.lowStock > 0 ? 'down' : 'up'}
          bg="#FFFAF0" />
        <StatCard icon="👥" label="Active Staff" value={loading ? '...' : stats.staff}
          badge="On roster" badgeType="neutral" bg="#F0FFF4" />
        <StatCard icon="🚚" label="Suppliers" value={loading ? '...' : stats.suppliers}
          badge="Active" badgeType="up" bg="#EBF8FF" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Low Stock Alerts</span>
            <button className="card-action" onClick={() => onNavigate('inventory')}>View All →</button>
          </div>
          <div className="card-body">
            {lowItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <p>All items are well-stocked!</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowItems.map(item => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.reorderPoint}</td>
                      <td><span className="badge badge-red"><span className="low-stock-dot"/>Low</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Team Members</span>
            <button className="card-action" onClick={() => onNavigate('staff')}>View All →</button>
          </div>
          <div className="card-body">
            {recentStaff.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p>No staff added yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentStaff.map(emp => (
                    <tr key={emp._id}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td>{emp.role}</td>
                      <td><span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {emp.status}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">💡 Quick Actions</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📦', label: `View ${BUSINESS_TYPES[businessType]?.modules.includes('inventory') ? 'Inventory' : 'Stock'}`, module: 'inventory' },
              { icon: '🚚', label: 'Manage Suppliers', module: 'suppliers' },
              { icon: '👥', label: 'Staff & Schedule', module: 'staff' },
              { icon: '📈', label: 'Analytics Report', module: 'analytics' }
            ].map(action => (
              <button key={action.module} className="btn btn-outline" onClick={() => onNavigate(action.module)}
                style={{ justifyContent: 'flex-start', gap: 10 }}>
                <span>{action.icon}</span> {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🤖 AI Suggestions</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.lowStock > 0 && (
              <div className="chat-action-card">
                <div className="chat-action-card-title">⚠️ Reorder Alert</div>
                <p style={{ fontSize: 13 }}>{stats.lowStock} item(s) are below reorder threshold. Ask AI to reorder now.</p>
              </div>
            )}
            <div className="chat-action-card" style={{ background: '#F0FFF4', borderColor: '#9AE6B4' }}>
              <div className="chat-action-card-title" style={{ color: '#276749' }}>💬 Try asking AI</div>
              <p style={{ fontSize: 13, color: '#2F855A' }}>
                "{bizConfig.samplePrompts[0]}"
              </p>
            </div>
            <div className="chat-action-card" style={{ background: '#EBF4FF', borderColor: '#90CDF4' }}>
              <div className="chat-action-card-title" style={{ color: '#2C5282' }}>📊 Business Insight</div>
              <p style={{ fontSize: 13, color: '#2A4A7F' }}>
                You have {stats.staff} active team members and {stats.suppliers} suppliers on record.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
