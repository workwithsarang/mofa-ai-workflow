import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AgentsList() {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await api.get('/agents');
      setAgents(res.data);
    } catch {
      setError('Failed to load agents');
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await api.delete(`/agents/${id}`);
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete agent');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Agents</h2>
        <button className="btn btn-primary" onClick={() => navigate('/agents/new')}>
          + New Agent
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {agents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
          No agents yet. <Link to="/agents/new">Create your first agent</Link>.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>
                    <code style={{ background: '#edf2ff', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.85rem' }}>
                      {agent.type}
                    </code>
                  </td>
                  <td>
                    <span className={`badge badge-${agent.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#718096' }}>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/agents/${agent.id}/edit`)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(agent.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
