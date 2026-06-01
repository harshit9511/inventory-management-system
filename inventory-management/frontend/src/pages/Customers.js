import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customersAPI } from '../services/api';

const INITIAL_FORM = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await customersAPI.getAll();
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await customersAPI.update(editing.id, form);
        toast.success('Customer updated!');
      } else {
        await customersAPI.create(form);
        toast.success('Customer created!');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id);
      toast.success('Customer deleted!');
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#4f8ef7', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Customer</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" />Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No customers found</h3>
            <p>Add your first customer to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: avatarColors[i % avatarColors.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                          {getInitials(customer.name)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-primary)' }}>{customer.email}</td>
                    <td>{customer.phone || '—'}</td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {customer.address ? (customer.address.length > 40 ? customer.address.slice(0, 40) + '...' : customer.address) : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(customer)} title="Edit">✏️</button>
                        <button className="btn-icon" onClick={() => setDeleteConfirm(customer.id)} title="Delete" style={{ color: 'var(--accent-danger)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Customer' : 'New Customer'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Update Customer' : 'Create Customer'}
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
              <h2>Delete Customer</h2>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Are you sure? This will also affect associated orders.</p>
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
