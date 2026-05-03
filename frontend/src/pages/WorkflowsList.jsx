import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState([]);
  const [agents, setAgents] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [wRes, aRes] = await Promise.all([
          api.get('/workflows'),
          api.get('/agents'),
        ]);
        setWorkflows(wRes.data);
        // Build id → name map
        const map = {};
        aRes.data.forEach(a => { map[a.id] = a.name; });
        setAgents(map);
      } catch {
        setError('Failed to load data');
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Workflows</h2>
        <button className="btn btn-primary" onClick={() => navigate('/workflows/new')}>
          + New Workflow
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {workflows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
          No workflows yet. <Link to="/workflows/new">Create your first workflow</Link>.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Agent A → Agent B</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(wf => (
                <tr key={wf.id}>
                  <td>{wf.name}</td>
                  <td style={{ fontSize: '0.875rem' }}>
                    <code style={{ background: '#edf2ff', padding: '0.1rem 0.3rem', borderRadius: 4 }}>
                      {agents[wf.agentIds[0]] || wf.agentIds[0]}
                    </code>
                    {' → '}
                    <code style={{ background: '#edf2ff', padding: '0.1rem 0.3rem', borderRadius: 4 }}>
                      {agents[wf.agentIds[1]] || wf.agentIds[1]}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#718096' }}>
                    {new Date(wf.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/workflows/${wf.id}/run`)}>
                      Run
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
