import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function WorkflowRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [agents, setAgents] = useState({});
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [wRes, aRes] = await Promise.all([
          api.get(`/workflows/${id}`),
          api.get('/agents'),
        ]);
        setWorkflow(wRes.data);
        const map = {};
        aRes.data.forEach(a => { map[a.id] = a; });
        setAgents(map);
      } catch {
        setError('Workflow not found');
      }
    }
    load();
  }, [id]);

  async function handleRun(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post(`/workflows/${id}/run`, { input });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Execution failed');
    } finally {
      setLoading(false);
    }
  }

  const agA = workflow ? agents[workflow.agentIds?.[0]] : null;
  const agB = workflow ? agents[workflow.agentIds?.[1]] : null;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2>Run Workflow</h2>
          {workflow && <p className="text-muted" style={{ marginTop: 2 }}>{workflow.name}</p>}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/workflows')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Pipeline */}
      {workflow && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div className="pipeline-display">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>INPUT</div>
              <div style={{ background: '#0f1117', border: '1px dashed #2d3148', borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#475569' }}>
                {input || 'your text'}
              </div>
            </div>
            <div className="pipe-arrow">→</div>
            {agA && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>STEP 1</div>
                <div className="pipe-node">{agA.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{agA.type}</div>
              </div>
            )}
            <div className="pipe-arrow">→</div>
            {agB && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>STEP 2</div>
                <div className="pipe-node">{agB.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{agB.type}</div>
              </div>
            )}
            <div className="pipe-arrow">→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>OUTPUT</div>
              <div style={{
                background: result ? 'rgba(22,163,74,.1)' : '#0f1117',
                border: `1px solid ${result ? 'rgba(22,163,74,.3)' : '#2d3148'}`,
                borderRadius: 6, padding: '0.35rem 0.75rem', fontSize: '0.78rem',
                color: result ? '#86efac' : '#475569',
                fontFamily: result ? 'monospace' : 'inherit',
                transition: 'all .3s',
                maxWidth: 120, wordBreak: 'break-all',
              }}>
                {result ? result.finalOutput : 'result'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="card">
        <form onSubmit={handleRun}>
          <div className="form-group">
            <label>Input Text</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter the text to process through this workflow…"
              style={{ minHeight: 90 }}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ gap: 8 }}>
            {loading ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Running…</>
            ) : '▶ Run Workflow'}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
            Execution Steps
          </h3>

          {result.steps.map(step => (
            <div className="step-card" key={step.index}>
              <div className="step-label">Step {step.index} — {step.agentName}</div>
              <div className="step-output">{step.output}</div>
            </div>
          ))}

          <div className="final-output-box">
            <div className="label">Final Output</div>
            <div className="value">{result.finalOutput}</div>
          </div>
        </div>
      )}
    </div>
  );
}
