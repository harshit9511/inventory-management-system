import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/orders', label: 'Orders', icon: '🛒' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">InvenFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="version-tag">v1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="topbar-title">Inventory & Order Management</div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
