import React, { useState } from 'react';
import { Rocket, ShieldCheck, Zap } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed.startsWith('gsk_')) {
      setError('Invalid key format. Groq API keys start with "gsk_".');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate connection check
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem('ic_groq_key', trimmed);
    onSave(trimmed);
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-logo">IC</div>
        <h1 className="modal-title">INNOVESTOR COPILOT</h1>
        <p className="modal-subtitle">
          Your AI-powered startup & investment intelligence agent, supercharged by <strong style={{ color: '#f97316' }}>Groq</strong> — the world's fastest AI inference.
        </p>

        <div className="modal-features">
          {[
            { icon: <Rocket size={14} />, text: 'Pitch coaching & deck review' },
            { icon: <Zap size={14} />, text: 'Market research & competitive analysis' },
            { icon: <ShieldCheck size={14} />, text: 'Investment due diligence checklists' },
            { icon: <Zap size={14} />, text: 'Financial modeling assistance' },
            { icon: <Zap size={14} />, text: 'Blazing-fast responses via Groq LPU™' },
          ].map((f, i) => (
            <div className="modal-feature" key={i}>
              <span className="feature-icon">{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-label">Groq Cloud API Key</div>
          <input
            className="modal-input"
            type="password"
            placeholder="gsk_..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            autoFocus
            id="api-key-input"
          />
          {error && <div className="modal-error">⚠ {error}</div>}
          <button className="modal-btn" type="submit" disabled={loading || !key.trim()} id="start-btn">
            {loading ? (
              <span className="flex-center gap-2">Connecting...</span>
            ) : (
              <>⚡ Launch Copilot</>
            )}
          </button>
        </form>

        <div className="modal-link">
          Don't have a key?{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
            Get one free at console.groq.com →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
