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
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/agents')
      .then(res => {
        const active = res.data.filter(a => a.status === 'ACTIVE');
        setAgents(active);
        if (active.length > 0) setAgentA(active[0].id);
        if (active.length > 1) setAgentB(active[1].id);
      })
      .catch(() => setError('Failed to load agents'))
      .finally(() => setFetching(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agentA || !agentB) return setError('Select both Agent A and Agent B');
    setError('');
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

  const selA = agents.find(a => a.id === agentA);
  const selB = agents.find(a => a.id === agentB);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>New Workflow</h2>
      </div>

      <div style={{ maxWidth: 600 }}>
        {error && <div className="alert alert-error">{error}</div>}

        {fetching ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : agents.length < 2 ? (
          <div className="card">
            <div className="empty-state">
              <div className="icon">⚠️</div>
              <p>You need at least 2 active agents to build a workflow.</p>
              <button className="btn btn-primary" onClick={() => navigate('/agents/new')}>
                Create Agents First
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live pipeline preview */}
            {(selA || selB) && (
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem', fontWeight: 700 }}>
                  Pipeline Preview
                </div>
                <div className="pipeline-display">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3 }}>INPUT</div>
                    <div style={{ background: '#0f1117', border: '1px dashed #2d3148', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: '#475569' }}>
                      your text
                    </div>
                  </div>
                  <div className="pipe-arrow">→</div>
                  {selA && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3 }}>STEP 1</div>
                      <div className="pipe-node">{selA.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{selA.type}</div>
                    </div>
                  )}
                  <div className="pipe-arrow">→</div>
                  {selB && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3 }}>STEP 2</div>
                      <div className="pipe-node">{selB.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{selB.type}</div>
                    </div>
                  )}
                  <div className="pipe-arrow">→</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3 }}>OUTPUT</div>
                    <div style={{ background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.3)', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: '#86efac' }}>
                      result
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Workflow Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Uppercase then Count" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Agent A — First Step *</label>
                    <select value={agentA} onChange={e => setAgentA(e.target.value)}>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Agent B — Second Step *</label>
                    <select value={agentB} onChange={e => setAgentB(e.target.value)}>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                    </select>
                  </div>
                </div>

                <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                  Output of Agent A becomes the input to Agent B automatically.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Workflow'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => navigate('/workflows')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
