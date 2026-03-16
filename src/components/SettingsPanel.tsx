import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff, Save, CheckCircle, Database } from 'lucide-react';
import { GROQ_MODELS, type GroqModel } from '../groqService';

interface SettingsProps {
  onClose: () => void;
  apiKey: string;
  activeModel: GroqModel;
  onUpdateKey: (key: string) => void;
  onModelChange: (model: GroqModel) => void;
}

const SettingsPanel: React.FC<SettingsProps> = ({
  onClose, apiKey, activeModel, onUpdateKey, onModelChange,
}) => {
  const [newKey, setNewKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = newKey.trim();
    if (trimmed) {
      localStorage.setItem('ic_groq_key', trimmed);
      onUpdateKey(trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div 
      className="settings-panel"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="settings-header">
        <span className="settings-title">⚙ Settings</span>
        <button className="icon-btn" onClick={onClose} id="settings-close-btn">
          <X size={18} />
        </button>
      </div>
      <div className="settings-body">
        {/* Status */}
        <div className="settings-item">
          <div className="settings-section-title">Connection Status</div>
          <div className={`api-status ${apiKey ? 'connected' : 'disconnected'}`}>
            <span className="status-dot">{apiKey ? '●' : '○'}</span>
            <span>{apiKey ? 'Connected to Groq Cloud' : 'Not connected'}</span>
          </div>
        </div>

        {/* Model selector */}
        <div className="settings-item">
          <div className="settings-section-title">AI Model</div>
          <div className="model-selector">
            {GROQ_MODELS.map((m) => (
              <button
                key={m.id}
                className={`model-option ${activeModel === m.id ? 'active' : ''}`}
                onClick={() => onModelChange(m.id)}
                id={`model-opt-${m.id}`}
              >
                <div className="model-option-header">
                  <Database size={14} className="model-icon" />
                  <span className="model-option-label">{m.label}</span>
                </div>
                <span className="model-option-desc">{m.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="settings-item">
          <div className="settings-section-title">Groq API Key</div>
          <div className="settings-input-wrap">
            <input
              className="settings-input"
              type={showKey ? 'text' : 'password'}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="gsk_..."
              id="settings-api-key-input"
            />
            <button
              className="settings-input-action"
              onClick={() => setShowKey((s) => !s)}
              type="button"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="settings-save-btn" onClick={handleSave} id="settings-save-btn">
            {saved ? (
              <span className="flex-center gap-2"><CheckCircle size={14} /> Saved!</span>
            ) : (
              <span className="flex-center gap-2"><Save size={14} /> Update API Key</span>
            )}
          </button>
        </div>

        {/* About */}
        <div className="settings-item about-section">
          <div className="settings-section-title">About</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <p><strong style={{ color: 'var(--text-secondary)' }}>INNOVESTOR COPILOT</strong></p>
            <p>Version 2.5.0 · Groq Edition</p>
            <p style={{ marginTop: '8px' }}>
              Powered by Groq LPU™ inference engine. Built for the Innovestor platform to assist founders and investors with blazing-fast AI responses.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPanel;
