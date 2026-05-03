import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function navLink(to, label) {
    const active = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        style={{
          padding: '0.4rem 0.75rem',
          borderRadius: 6,
          background: active ? '#4f46e5' : 'transparent',
          color: active ? '#fff' : '#e2e8f0',
          fontWeight: 500,
          fontSize: '0.9rem',
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav
      style={{
        background: '#1e1b4b',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        height: 52,
        marginBottom: '1.5rem',
      }}
    >
      <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '1rem', marginRight: '1rem' }}>
        Mofa-AI
      </span>

      {token && (
        <>
          {navLink('/agents', 'Agents')}
          {navLink('/workflows', 'Workflows')}
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        {token ? (
          <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }} onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            {navLink('/login', 'Login')}
            {navLink('/register', 'Register')}
          </>
        )}
      </div>
    </nav>
  );
}
