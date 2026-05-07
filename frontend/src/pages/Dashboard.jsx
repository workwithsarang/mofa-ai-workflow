import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const TYPE_META = {
  UPPERCASE:  { icon: '🔠', desc: 'Converts text to ALL CAPS' },
  WORD_COUNT: { icon: '🔢', desc: 'Counts words in the text' },
  REVERSE:    { icon: '🔄', desc: 'Reverses every character' },
  TRIM:       { icon: '✂️',  desc: 'Strips leading/trailing spaces' },
};

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [aRes, wRes] = await Promise.all([api.get('/agents'), api.get('/workflows')]);
        setAgents(aRes.data);
        setWorkflows(wRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeAgents = agents.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted" style={{ marginTop: 2 }}>Overview of your agents and workflows</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/agents/new')}>+ New Agent</button>
          <button className="btn btn-primary"   onClick={() => navigate('/workflows/new')}>+ New Workflow</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">{agents.length}</div>
              <div className="stat-label">Total agents</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#22c55e' }}>{activeAgents}</div>
              <div className="stat-label">Active agents</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#38bdf8' }}>{workflows.length}</div>
              <div className="stat-label">Workflows</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#f59e0b' }}>4</div>
              <div className="stat-label">Agent types available</div>
            </div>
          </div>

          {/* Agent types reference */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#94a3b8' }}>Agent Types</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <div key={type} style={{
                  background: '#0f1117',
                  border: '1px solid #2d3148',
                  borderRadius: 8,
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 700 }}>{type}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{meta.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent agents */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Recent Agents</h3>
                <Link to="/agents" style={{ fontSize: '0.78rem' }}>View all →</Link>
              </div>
              {agents.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <p>No agents yet</p>
                  <Link to="/agents/new" className="btn btn-primary btn-sm">Create one</Link>
                </div>
              ) : (
                agents.slice(0, 4).map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0', borderBottom: '1px solid #1e2235',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.name}</div>
                      <span className="badge badge-type" style={{ marginTop: 3 }}>{a.type}</span>
                    </div>
                    <span className={`badge badge-${a.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Recent Workflows</h3>
                <Link to="/workflows" style={{ fontSize: '0.78rem' }}>View all →</Link>
              </div>
              {workflows.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <p>No workflows yet</p>
                  <Link to="/workflows/new" className="btn btn-primary btn-sm">Create one</Link>
                </div>
              ) : (
                workflows.slice(0, 4).map(wf => (
                  <div key={wf.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0', borderBottom: '1px solid #1e2235',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{wf.name}</div>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/workflows/${wf.id}/run`)}>
                      ▶ Run
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
