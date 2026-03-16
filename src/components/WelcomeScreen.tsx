import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentMode, AgentModeConfig } from '../types';
import AnimatedLogo from './AnimatedLogo';
import DynamicIcon from './DynamicIcon';
import { AGENT_MODES } from '../agentModes';
import { ChevronDown } from 'lucide-react';

interface WelcomeProps {
  mode: AgentModeConfig;
  onModeChange: (modeId: AgentMode) => void;
}

const WelcomeScreen: React.FC<WelcomeProps> = ({ mode, onModeChange }) => {
  const [showModes, setShowModes] = React.useState(false);

  return (
  <div className="welcome-screen" style={{ justifyContent: 'flex-start', paddingTop: '10vh' }}>
    <motion.div 
      className="welcome-logo"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 12 }}
    >
      <AnimatedLogo isThinking={true} size={48} />
    </motion.div>
    <motion.h1 
      className="welcome-title"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      INNOVESTOR COPILOT
    </motion.h1>
    <motion.p 
      className="welcome-subtitle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Your AI-powered agent for startups, fundraising & investment intelligence. Supercharged by <span style={{ color: '#f97316', fontWeight: 600 }}>Groq LPU™</span>.
    </motion.p>
    
    <div className="mode-selector-container">
      <motion.button 
        className="welcome-mode-highlight clickable"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => setShowModes(!showModes)}
      >
        <DynamicIcon name={mode.icon} size={16} color={mode.color} glowColor={mode.color} />
        <span>Agent: {mode.label}</span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </motion.button>

      <AnimatePresence>
        {showModes && (
          <motion.div 
            className="welcome-mode-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            <div className="dropdown-label">CHOOSE AGENT MODE</div>
            <div className="dropdown-grid">
              {AGENT_MODES.map((m) => (
                <button 
                  key={m.id}
                  className={`dropdown-item ${mode.id === m.id ? 'active' : ''}`}
                  onClick={() => {
                    onModeChange(m.id);
                    setShowModes(false);
                  }}
                >
                  <div className="item-icon-circle" style={{ background: `${m.color}15`, color: m.color }}>
                    <DynamicIcon name={m.icon} size={16} />
                  </div>
                  <div className="item-text">
                    <span className="item-name">{m.label}</span>
                    <span className="item-desc">{m.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

export default WelcomeScreen;
