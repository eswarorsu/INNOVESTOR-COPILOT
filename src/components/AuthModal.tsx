import React, { useState } from 'react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, ArrowRight, ShieldCheck, KeyRound, Fingerprint, ExternalLink } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import innovestorLogo from '../assets/innovestor-logo.jpeg';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const EnrollmentView: React.FC<{ onBack: () => void; onClose: () => void }> = ({ onBack, onClose }) => (
  <motion.div
    key="enrollment"
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 30 }}
    transition={{ type: 'spring', damping: 22, stiffness: 120 }}
  >
    <div className="auth-card-header">
      <div style={{ width: 32 }} />
      <button onClick={onClose} className="auth-close-btn">
        <X size={20} />
      </button>
    </div>

    <div className="auth-card-body" style={{ textAlign: 'center' }}>
      {/* Innovestor Brand Logo */}
      <div className="enrollment-logo-wrapper">
        <img
          src={innovestorLogo}
          alt="Innovestor"
          className="enrollment-brand-logo"
        />
      </div>

      <h2 className="auth-title" style={{ marginBottom: 10 }}>Join Innovestor</h2>
      <p className="auth-subtitle" style={{ marginBottom: 32, maxWidth: 280, margin: '0 auto 32px' }}>
        To continue using the Innovestor Copilot, create your account on our platform.
      </p>

      <a
        href="https://innovestor.online"
        target="_blank"
        rel="noopener noreferrer"
        className="enrollment-cta-link"
      >
        <span>Go to innovestor.online</span>
        <ExternalLink size={16} />
      </a>

      <div style={{ marginTop: 32 }}>
        <button onClick={onBack} className="auth-toggle-link">
          Already have an account? Sign In
        </button>
      </div>

      <div className="auth-security-tag" style={{ justifyContent: 'center', marginTop: 24 }}>
        <ShieldCheck size={12} />
        <span>256-BIT ENCRYPTION ACTIVE</span>
      </div>
    </div>
  </motion.div>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<'login' | 'enrollment'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setView('login');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      onSuccess(data.user);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-overlay" onClick={handleClose}>
          <motion.div
            className="auth-premium-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <AnimatePresence mode="wait">
              {view === 'enrollment' ? (
                <EnrollmentView key="enrollment" onBack={() => setView('login')} onClose={handleClose} />
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 120 }}
                >
                  <div className="auth-card-header">
                    <div className="auth-logo-circle">
                      <AnimatedLogo size={44} isThinking={loading} />
                    </div>
                    <button onClick={handleClose} className="auth-close-btn">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="auth-card-body">
                    <div className="auth-welcome-text">
                      <h2 className="auth-title">Welcome Back</h2>
                      <p className="auth-subtitle">Authenticated access to investment intelligence</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                      <div className="auth-input-group">
                        <span className="auth-label">Identity</span>
                        <div className="auth-input-wrapper">
                          <Mail size={16} className="auth-input-icon" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="Email address"
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <span className="auth-label">Passcode</span>
                        <div className="auth-input-wrapper">
                          <KeyRound size={16} className="auth-input-icon" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="auth-error-panel"
                          >
                            <Fingerprint size={14} />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                      >
                        <div className="btn-content">
                          {loading ? (
                            <Loader2 className="spinner" size={18} />
                          ) : (
                            <>
                              <span>Authorize Session</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </div>
                        <div className="btn-glow" />
                      </button>
                    </form>

                    <div className="auth-footer">
                      <button
                        onClick={() => setView('enrollment')}
                        className="auth-toggle-link"
                      >
                        Switch to Enrollment
                      </button>

                      <div className="auth-security-tag">
                        <ShieldCheck size={12} />
                        <span>256-BIT ENCRYPTION ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
