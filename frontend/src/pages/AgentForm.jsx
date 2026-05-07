import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const TYPES = [
  { value: 'UPPERCASE',  icon: '🔠', desc: 'Converts text to ALL CAPS' },
  { value: 'WORD_COUNT', icon: '🔢', desc: 'Counts the number of words' },
  { value: 'REVERSE',    icon: '🔄', desc: 'Reverses every character' },
  { value: 'TRIM',       icon: '✂️',  desc: 'Strips leading/trailing spaces' },
];

export default function AgentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [type, setType] = useState('UPPERCASE');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/agents/${id}`)
        .then(res => {
          setName(res.data.name);
          setType(res.data.type);
          setStatus(res.data.status);
        })
        .catch(() => setError('Failed to load agent'));
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/agents/${id}`, { name, type, status });
      } else {
        await api.post('/agents', { name, type, status });
      }
      navigate('/agents');
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  const selectedType = TYPES.find(t => t.value === type);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>{isEdit ? 'Edit Agent' : 'New Agent'}</h2>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Agent Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. My Uppercase Bot" required />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.value} — {t.desc}</option>
              ))}
            </select>
            {selectedType && (
              <div className="alert alert-info" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <strong>{selectedType.icon} {selectedType.value}</strong> — {selectedType.desc}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Status</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['ACTIVE', 'INACTIVE'].map(s => (
                <label key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.5rem 1rem',
                  border: `1px solid ${status === s ? '#6366f1' : '#2d3148'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: status === s ? 'rgba(99,102,241,.12)' : '#0f1117',
                  flex: 1,
                }}>
                  <input type="radio" name="status" value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    style={{ accentColor: '#6366f1' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: status === s ? '#a5b4fc' : '#64748b' }}>
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
