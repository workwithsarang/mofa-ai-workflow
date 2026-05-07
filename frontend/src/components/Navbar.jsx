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

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  return (
    <nav style={{
      background: '#13152a',
      borderBottom: '1px solid #1e2235',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to={token ? '/dashboard' : '/login'} style={{
        color: '#818cf8',
        fontWeight: 800,
        fontSize: '1rem',
        letterSpacing: '-0.02em',
        marginRight: '1.25rem',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: '1.2rem' }}>⚡</span>
        Mofa-AI
      </Link>

      {token && (
        <>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
          <NavLink to="/agents"    active={isActive('/agents')}>Agents</NavLink>
          <NavLink to="/workflows" active={isActive('/workflows')}>Workflows</NavLink>
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {token ? (
          <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
        ) : (
          <>
            <NavLink to="/login"    active={isActive('/login')}>Login</NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '0.35rem 0.75rem',
      borderRadius: 7,
      background: active ? 'rgba(99,102,241,.18)' : 'transparent',
      color: active ? '#a5b4fc' : '#64748b',
      fontWeight: 600,
      fontSize: '0.875rem',
      textDecoration: 'none',
      transition: 'color .15s, background .15s',
    }}>
      {children}
    </Link>
  );
}
