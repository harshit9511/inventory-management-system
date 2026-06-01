import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../services/api';

const INITIAL_FORM = { name: '', sku: '', description: '', price: '', stock_quantity: '', category: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
      };
      if (editing) {
        await productsAPI.update(editing.id, data);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(data);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted!');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Products</h1>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" />Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <p>Add your first product to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      {product.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {product.description.slice(0, 50)}{product.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td><code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{product.sku}</code></td>
                    <td>{product.category ? <span className="badge badge-secondary">{product.category}</span> : '—'}</td>
                    <td style={{ fontWeight: 600 }}>₹{product.price.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${product.stock_quantity <= 0 ? 'badge-danger' : product.stock_quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {product.stock_quantity} units
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(product)} title="Edit">✏️</button>
                        <button className="btn-icon" onClick={() => setDeleteConfirm(product.id)} title="Delete" style={{ color: 'var(--accent-danger)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Name *</label>
                    <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laptop Pro X" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input className="form-control" required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. LPX-001" disabled={!!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-control" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input className="form-control" type="number" min="0" required value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Product</h2>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this product? This action cannot be undone.</p>
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
