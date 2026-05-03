import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function WorkflowRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/workflows/${id}`)
      .then(res => setWorkflow(res.data))
      .catch(() => setError('Workflow not found'));
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

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h2>Run Workflow{workflow ? `: ${workflow.name}` : ''}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/workflows')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleRun}>
          <div className="form-group">
            <label>Input String</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter the text to process through the workflow…"
              style={{ minHeight: 100 }}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Running…' : 'Run Workflow'}
          </button>
        </form>
      </div>

      {result && (
        <div>
          <h3 style={{ margin: '1.25rem 0 0.5rem' }}>Execution Steps</h3>

          {result.steps.map(step => (
            <div className="step-card" key={step.index}>
              <div className="step-label">Step {step.index} — {step.agentName}</div>
              <div className="step-output">{step.output}</div>
            </div>
          ))}

          <div className="final-output">
            <h3>Final Output</h3>
            <div className="value">{result.finalOutput}</div>
          </div>
        </div>
      )}
    </div>
  );
}
