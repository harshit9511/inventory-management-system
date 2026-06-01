import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Loading dashboard...
    </div>
  );

  if (!stats) return <div className="empty-state"><p>Could not load dashboard data.</p></div>;

  const statCards = [
    { label: 'Total Products', value: stats.total_products, icon: '📦', color: '#4f8ef7' },
    { label: 'Total Customers', value: stats.total_customers, icon: '👥', color: '#7c3aed' },
    { label: 'Total Orders', value: stats.total_orders, icon: '🛒', color: '#06b6d4' },
    { label: 'Revenue (Delivered)', value: `₹${stats.total_revenue.toLocaleString()}`, icon: '💰', color: '#10b981' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: '⏳', color: '#f59e0b' },
    { label: 'Low Stock Items', value: stats.low_stock_products, icon: '⚠️', color: '#ef4444' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory and orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${stat.color}` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '600' }}>Recent Orders</h3>
          {stats.recent_orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">🛒</div>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>₹{order.total_amount.toLocaleString()}</td>
                      <td><span className={`badge ${statusColors[order.status] || 'badge-secondary'}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '600' }}>Top Selling Products</h3>
          {stats.top_products.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon">📦</div>
              <p>No sales data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.top_products} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #2d3748', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="total_sold" fill="#4f8ef7" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
