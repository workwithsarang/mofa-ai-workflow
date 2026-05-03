import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const TYPES = ['UPPERCASE', 'WORD_COUNT', 'REVERSE', 'TRIM'];

export default function AgentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState('UPPERCASE');
  const [status, setStatus] = useState('ACTIVE');
  const [inputSchema, setInputSchema] = useState('');
  const [processingLogic, setProcessingLogic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/agents/${id}`)
        .then(res => {
          setName(res.data.name);
          setType(res.data.type);
          setStatus(res.data.status);
          setInputSchema(res.data.inputSchema || '');
          setProcessingLogic(res.data.processingLogic || '');
        })
        .catch(() => setError('Failed to load agent'));
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { name, type, status, inputSchema: inputSchema || null, processingLogic: processingLogic || null };
    try {
      if (isEdit) {
        await api.put(`/agents/${id}`, payload);
      } else {
        await api.post('/agents', payload);
      }
      navigate('/agents');
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header">
        <h2>{isEdit ? 'Edit Agent' : 'New Agent'}</h2>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Input Schema (optional)</label>
            <textarea value={inputSchema} onChange={e => setInputSchema(e.target.value)}
              placeholder="Describe expected input format…" />
          </div>
          <div className="form-group">
            <label>Processing Logic (optional notes)</label>
            <textarea value={processingLogic} onChange={e => setProcessingLogic(e.target.value)}
              placeholder="Notes about processing logic…" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Agent' : 'Create Agent'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/agents')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
