import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function WorkflowBuilder() {
  const [name, setName] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentA, setAgentA] = useState('');
  const [agentB, setAgentB] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/agents')
      .then(res => {
        const active = res.data.filter(a => a.status === 'ACTIVE');
        setAgents(active);
        if (active.length > 0) setAgentA(active[0].id);
        if (active.length > 1) setAgentB(active[1].id);
      })
      .catch(() => setError('Failed to load agents'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!agentA || !agentB) {
      return setError('Select both Agent A and Agent B');
    }
    setLoading(true);
    try {
      await api.post('/workflows', { name, agentIds: [agentA, agentB] });
      navigate('/workflows');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header">
        <h2>New Workflow</h2>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        {agents.length < 2 ? (
          <div className="alert alert-error">
            You need at least 2 active agents to build a workflow.{' '}
            <a href="/agents/new">Create agents first</a>.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Workflow Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Agent A (first step) *</label>
              <select value={agentA} onChange={e => setAgentA(e.target.value)}>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Agent B (second step — receives Agent A output) *</label>
              <select value={agentB} onChange={e => setAgentB(e.target.value)}>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
            <div style={{ color: '#718096', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Flow: <strong>your input</strong> → Agent A → Agent B → <strong>final output</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create Workflow'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/workflows')}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
