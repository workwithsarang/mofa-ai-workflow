import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const TYPE_ICONS = { UPPERCASE: '🔠', WORD_COUNT: '🔢', REVERSE: '🔄', TRIM: '✂️' };

export default function AgentsList() {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await api.get('/agents');
      setAgents(res.data);
    } catch {
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this agent? This cannot be undone.')) return;
    try {
      await api.delete(`/agents/${id}`);
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete agent');
    }
  }

  async function toggleStatus(agent) {
    const next = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/agents/${agent.id}`, { status: next });
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: next } : a));
    } catch {
      setError('Failed to update status');
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2>Agents</h2>
          <p className="text-muted" style={{ marginTop: 2 }}>{agents.length} agent{agents.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/agents/new')}>+ New Agent</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : agents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🤖</div>
            <p>No agents yet. Create your first one to get started.</p>
            <Link to="/agents/new" className="btn btn-primary">Create Agent</Link>
          </div>
        </div>
      ) : (
        <div className="agent-grid">
          {agents.map(agent => (
            <div className="agent-card" key={agent.id}>
              <div className="agent-card-top">
                <div className="type-icon">{TYPE_ICONS[agent.type] || '⚙️'}</div>
                <span className={`badge badge-${agent.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {agent.status}
                </span>
              </div>

              <div>
                <div className="agent-card-name">{agent.name}</div>
                <div className="agent-card-meta" style={{ marginTop: 6 }}>
                  <span className="badge badge-type">{agent.type}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="agent-card-actions">
                <button className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/agents/${agent.id}/edit`)}>
                  Edit
                </button>
                <button
                  className={`btn btn-sm ${agent.status === 'ACTIVE' ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => toggleStatus(agent)}>
                  {agent.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(agent.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
