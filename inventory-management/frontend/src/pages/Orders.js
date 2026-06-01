import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ordersAPI, customersAPI, productsAPI } from '../services/api';

const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Order form state
  const [form, setForm] = useState({ customer_id: '', notes: '' });
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  const fetchAll = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        ordersAPI.getAll(),
        customersAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ customer_id: '', notes: '' });
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setShowModal(true);
  };

  const addItem = () => setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...orderItems];
    updated[i] = { ...updated[i], [field]: value };
    setOrderItems(updated);
  };

  const getProductStock = (productId) => {
    const p = products.find(p => p.id === parseInt(productId));
    return p ? p.stock_quantity : 0;
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      return sum + (product ? product.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) { toast.error('Please select a customer'); return; }
    if (orderItems.some(i => !i.product_id || !i.quantity)) { toast.error('Please fill all order items'); return; }

    setSubmitting(true);
    try {
      const data = {
        customer_id: parseInt(form.customer_id),
        notes: form.notes,
        items: orderItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      };
      await ordersAPI.create(data);
      toast.success('Order created successfully!');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      toast.success('Order status updated!');
      fetchAll();
      if (showDetail) setShowDetail(orders.find(o => o.id === orderId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ordersAPI.delete(id);
      toast.success('Order deleted!');
      setDeleteConfirm(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛒 Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>

      <div className="filters-bar">
        <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{filtered.length} orders shown</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" />Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>No orders found</h3>
            <p>Create your first order to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td><span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>#{order.id}</span></td>
                    <td>{order.customer?.name || `Customer #${order.customer_id}`}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td style={{ fontWeight: 600 }}>₹{order.total_amount.toLocaleString()}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                        value={order.status}
                        onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => setShowDetail(order)} title="View Details">👁️</button>
                        <button className="btn-icon" onClick={() => setDeleteConfirm(order.id)} title="Delete" style={{ color: 'var(--accent-danger)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Order</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-control" required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0 }}>Order Items *</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                  </div>
                  {orderItems.map((item, i) => {
                    const stock = item.product_id ? getProductStock(item.product_id) : null;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                        <div>
                          <select className="form-control" required value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                            <option value="">Select product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                                {p.name} — ₹{p.price} (Stock: {p.stock_quantity})
                              </option>
                            ))}
                          </select>
                          {stock !== null && stock <= 10 && (
                            <span style={{ fontSize: '0.75rem', color: stock === 0 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                              {stock === 0 ? '⚠️ Out of stock' : `⚠️ Only ${stock} left`}
                            </span>
                          )}
                        </div>
                        <input
                          className="form-control"
                          type="number"
                          min="1"
                          max={stock || 999}
                          required
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)}
                          style={{ width: 80 }}
                        />
                        {orderItems.length > 1 && (
                          <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--accent-danger)' }}>✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions..." />
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Total:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '1.1rem' }}>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{showDetail.id} Details</h2>
              <button className="btn-icon" onClick={() => setShowDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>CUSTOMER</div>
                  <div style={{ fontWeight: 500 }}>{showDetail.customer?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{showDetail.customer?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>STATUS</div>
                  <span className={`badge ${STATUS_COLORS[showDetail.status]}`}>{showDetail.status}</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL AMOUNT</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-success)' }}>₹{showDetail.total_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>DATE</div>
                  <div>{showDetail.created_at ? new Date(showDetail.created_at).toLocaleString('en-IN') : '—'}</div>
                </div>
              </div>

              {showDetail.notes && (
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>NOTES</div>
                  <div style={{ fontSize: '0.875rem' }}>{showDetail.notes}</div>
                </div>
              )}

              <h4 style={{ marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</h4>
              <table className="table" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(showDetail.items || []).map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unit_price.toLocaleString()}</td>
                      <td style={{ fontWeight: 500 }}>₹{(item.quantity * item.unit_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Order</h2>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Delete this order? Stock will be restored automatically if not cancelled.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
