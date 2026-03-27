import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgentMode } from '../types';
import AnimatedLogo from './AnimatedLogo';
import DynamicIcon from './DynamicIcon';
import { AGENT_MODES } from '../agentModes';

interface SidebarProps {
  activeMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange, collapsed, onToggle }) => (
  <motion.aside 
    className={`sidebar ${collapsed ? 'collapsed' : ''}`}
    animate={{ width: collapsed ? 64 : 260 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="sidebar-logo">
      <div className="logo-icon">
        <AnimatedLogo isThinking={false} size={24} />
      </div>
      {!collapsed && (
        <motion.div 
          className="logo-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="logo-title">INNOVESTOR</span>
          <span className="logo-subtitle">COPILOT AI Agent</span>
        </motion.div>
      )}
    </div>

    {!collapsed && (
      <motion.div 
        className="sidebar-section-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Agent Modes
      </motion.div>
    )}

    <div className="mode-list">
      {AGENT_MODES.map((m) => (
        <button
          key={m.id}
          className={`mode-btn ${activeMode === m.id ? 'active' : ''}`}
          onClick={() => onModeChange(m.id)}
          title={collapsed ? m.label : ''}
          id={`mode-btn-${m.id}`}
        >
          <span className="mode-icon">
            <DynamicIcon name={m.icon} size={18} color={m.color} glowColor={activeMode === m.id ? m.color : undefined} />
          </span>
          {!collapsed && (
            <motion.span 
              className="mode-info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="mode-label">{m.label}</span>
              <span className="mode-desc">{m.description}</span>
            </motion.span>
          )}
        </button>
      ))}
    </div>

    <div className="sidebar-footer">
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar" id="sidebar-toggle-btn">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  </motion.aside>
);

export default Sidebar;
