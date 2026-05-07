import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState([]);
  const [agentMap, setAgentMap] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [wRes, aRes] = await Promise.all([api.get('/workflows'), api.get('/agents')]);
        setWorkflows(wRes.data);
        const map = {};
        aRes.data.forEach(a => { map[a.id] = a; });
        setAgentMap(map);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch {
      setError('Failed to delete workflow');
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2>Workflows</h2>
          <p className="text-muted" style={{ marginTop: 2 }}>{workflows.length} workflow{workflows.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/workflows/new')}>+ New Workflow</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : workflows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🔗</div>
            <p>No workflows yet. Chain two agents together to create one.</p>
            <Link to="/workflows/new" className="btn btn-primary">Create Workflow</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workflows.map(wf => {
            const agA = agentMap[wf.agentIds[0]];
            const agB = agentMap[wf.agentIds[1]];
            return (
              <div className="card" key={wf.id} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>{wf.name}</div>
                    <div className="pipeline-display">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div className="pipe-node">{agA?.name || wf.agentIds[0]}</div>
                        <div style={{ fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>{agA?.type}</div>
                      </div>
                      <div className="pipe-arrow">→</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div className="pipe-node">{agB?.name || wf.agentIds[1]}</div>
                        <div style={{ fontSize: '0.68rem', color: '#475569', textAlign: 'center' }}>{agB?.type}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {new Date(wf.createdAt).toLocaleDateString()}
                    </span>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/workflows/${wf.id}/run`)}>
                      ▶ Run
                    </button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(wf.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
