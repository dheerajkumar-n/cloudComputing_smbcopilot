import React, { useState, useEffect } from 'react';
import { inventoryAPI, staffAPI, suppliersAPI } from '../../services/api';
import { BUSINESS_TYPES } from '../../config/businessConfig';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-item">
          <span className="bar-value">{d.value}</span>
          <div className="bar-fill" style={{ height: `${Math.round((d.value / max) * 90)}%`, background: color }} />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MetricRow({ label, value, sub, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F7FAFC' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#A0AEC0' }}>{sub}</div>}
      </div>
      <div style={{ fontWeight: 700, color: color || '#2D3748', fontSize: 15 }}>{value}</div>
    </div>
  );
}

export default function AnalyticsModule({ businessId, businessType }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const bizConfig = BUSINESS_TYPES[businessType];

  useEffect(() => {
    async function load() {
      try {
        const [items, lowItems, staff, suppliers, orders] = await Promise.all([
          inventoryAPI.getItems(businessId),
          inventoryAPI.getLowStock(businessId),
          staffAPI.getEmployees(businessId),
          suppliersAPI.getSuppliers(businessId),
          inventoryAPI.getReorders(businessId)
        ]);

        const totalInventoryCost = items.reduce((sum, i) => sum + (i.cost || 0) * i.quantity, 0);
        const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
        const catBreakdown = categories.slice(0, 7).map(cat => ({
          label: cat.substring(0, 4),
          value: items.filter(i => i.category === cat).reduce((s, i) => s + i.quantity, 0)
        }));

        const ordersByStatus = {
          pending: orders.filter(o => o.status === 'pending').length,
          ordered: orders.filter(o => o.status === 'ordered').length,
          received: orders.filter(o => o.status === 'received').length
        };

        const simulatedWeeklySales = WEEK_DAYS.map((label, i) => ({
          label,
          value: Math.floor(Math.random() * 80 + 20 + (i === 5 || i === 6 ? 40 : 0))
        }));

        setData({
          totalItems: items.length,
          lowItemsCount: lowItems.length,
          totalStaff: staff.length,
          activeStaff: staff.filter(s => s.status === 'active').length,
          totalSuppliers: suppliers.length,
          avgRating: suppliers.length > 0
            ? (suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length).toFixed(1)
            : 'N/A',
          totalOrders: orders.length,
          ordersByStatus,
          totalInventoryCost,
          catBreakdown,
          simulatedWeeklySales,
          topItems: [...items].sort((a, b) => b.cost - a.cost).slice(0, 5)
        });
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId]);

  if (loading) return <div className="empty-state" style={{ paddingTop: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  if (!data) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-state-icon">📊</div>
      <p>Could not load analytics. Ensure backend is running.</p>
    </div>
  );

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-header-left">
          <h2>📈 Analytics & Reports</h2>
          <p>{bizConfig.label} performance overview</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#FFF5F7' }}>📦</div>
            <span className={`stat-badge ${data.lowItemsCount > 0 ? 'warn' : 'up'}`}>
              {data.lowItemsCount > 0 ? `${data.lowItemsCount} low` : 'All OK'}
            </span>
          </div>
          <div className="stat-value">{data.totalItems}</div>
          <div className="stat-label">Inventory Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#F0FFF4' }}>💰</div>
            <span className="stat-badge neutral">Stock Value</span>
          </div>
          <div className="stat-value">${data.totalInventoryCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Inventory Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#EBF8FF' }}>👥</div>
            <span className="stat-badge up">{data.activeStaff} active</span>
          </div>
          <div className="stat-value">{data.totalStaff}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: '#FAF5FF' }}>🔄</div>
            <span className={`stat-badge ${data.ordersByStatus.pending > 0 ? 'warn' : 'up'}`}>
              {data.ordersByStatus.pending} pending
            </span>
          </div>
          <div className="stat-value">{data.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Simulated Weekly Activity</span>
          </div>
          <div className="card-body">
            <BarChart data={data.simulatedWeeklySales} color={bizConfig.color} />
            <p style={{ fontSize: 11, color: '#A0AEC0', textAlign: 'center', marginTop: 8 }}>
              Simulated demo data · Connect POS for real sales
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 Inventory by Category</span>
          </div>
          <div className="card-body">
            {data.catBreakdown.length > 0 ? (
              <BarChart data={data.catBreakdown} color="#667eea" />
            ) : (
              <div className="empty-state"><p>No category data</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Order Summary</span>
          </div>
          <div className="card-body">
            <MetricRow label="Pending Orders" value={data.ordersByStatus.pending} color="#ED8936" sub="Awaiting approval" />
            <MetricRow label="Active Orders" value={data.ordersByStatus.ordered} color="#667eea" sub="Placed with suppliers" />
            <MetricRow label="Received Orders" value={data.ordersByStatus.received} color="#48BB78" sub="Completed" />
            <MetricRow label="Total Orders" value={data.totalOrders} sub="All time" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🔑 Key Metrics</span>
          </div>
          <div className="card-body">
            <MetricRow label="Stock Health" value={`${Math.round(((data.totalItems - data.lowItemsCount) / Math.max(data.totalItems, 1)) * 100)}%`}
              color="#48BB78" sub={`${data.lowItemsCount} items low`} />
            <MetricRow label="Avg Supplier Rating" value={`${data.avgRating} / 5 ★`} color="#F6AD55" sub={`${data.totalSuppliers} suppliers`} />
            <MetricRow label="Staff Utilization" value={`${Math.round((data.activeStaff / Math.max(data.totalStaff, 1)) * 100)}%`}
              color="#667eea" sub={`${data.activeStaff} of ${data.totalStaff} active`} />
            {data.topItems[0] && (
              <MetricRow label="Highest Value Item" value={`$${data.topItems[0].cost}`}
                sub={data.topItems[0].name} color="#9F7AEA" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
