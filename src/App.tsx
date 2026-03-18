import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Zap, Paperclip, Mic, ChevronDown, Database } from 'lucide-react';

import type { Message, AgentMode } from './types';
import { GROQ_MODELS, groqService, type GroqModel } from './groqService';
import { getMode } from './agentModes';

// Components
import MessageItem from './components/MessageItem';
import WelcomeScreen from './components/WelcomeScreen';
import AnimatedLogo from './components/AnimatedLogo';
import DynamicIcon from './components/DynamicIcon';
import NewsSection from './components/NewsSection';
import { Newspaper, MessageSquare } from 'lucide-react';

/* ─── Typing Indicator ──────────────────────────────────────── */
const TypingIndicator: React.FC = () => (
  <motion.div 
    className="message-wrapper ai"
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="message-avatar ai">
      <AnimatedLogo isThinking={true} size={28} />
    </div>
    <div className="message-body">
      <div className="message-meta"><span>Copilot</span><span>thinking…</span></div>
      <div className="message-bubble ai">
        <div className="typing-indicator-text">
          Innovestor Copilot is processing your request...
        </div>
      </div>
    </div>
  </motion.div>
);

/* ─── Main App ──────────────────────────────────────────────── */
const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AgentMode>('general');
  const [activeModel, setActiveModel] = useState<GroqModel>(groqService.getModel());
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [toast, setToast] = useState('');
  const [view, setView] = useState<'copilot' | 'news'>('copilot');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMode = getMode(activeMode);

  useEffect(() => {
    // We use 'auto' instead of 'smooth' to prevent aggressive jittering
    // when the AI streams hundreds of characters per second.
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, showTyping]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };


  const handleModeChange = (mode: AgentMode) => {
    setActiveMode(mode);
    setMessages([]);
  };

  const handleModelChange = (model: GroqModel) => {
    setActiveModel(model);
    groqService.setModel(model);
    groqService.clearAllSessions();
    setMessages([]);
    const m = GROQ_MODELS.find((x) => x.id === model);
    showToast(`Model: ${m?.label ?? model}`);
  };

  const handleSend = async (customText?: string) => {
    const content = typeof customText === 'string' ? customText : input.trim();
    if (!content || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowTyping(true);
    setIsStreaming(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await new Promise((r) => setTimeout(r, 400));
    setShowTyping(false);

    const aiMsgId = crypto.randomUUID();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'model',
      content: '',
      timestamp: new Date(),
      mode: activeMode,
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMsg]);

    groqService.sendMessageStream(
      content,
      activeMode,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)
        );
      },
      () => {
        setMessages((prev) =>
          prev.map((m) => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
        );
        setIsStreaming(false);
      },
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: `⚠ **Error:** ${err}`, isStreaming: false }
              : m
          )
        );
        setIsStreaming(false);
        setShowTyping(false);
        showToast('Error from Groq. Check your API key.');
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  };

  const clearChat = () => {
    setMessages([]);
    groqService.clearSession(activeMode);
    showToast('Conversation cleared');
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    handleSend(text);
  };

  const activeModelInfo = GROQ_MODELS.find((m) => m.id === activeModel);

  return (
    <div className="app-layout">
      {/* Space Background */}
      <div className="stars-container">
        <div className="star-layer star-layer-1"></div>
        <div className="star-layer star-layer-2"></div>
        <div className="star-layer star-layer-3"></div>
      </div>

      <div className="main-area">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-mode-badge">
              <div className="topbar-mode-dot" style={{ background: currentMode.color }} />
              <DynamicIcon name={currentMode.icon} size={14} color={currentMode.color} style={{ marginRight: '6px' }} />
              <span>{currentMode.label}</span>
            </div>
            <div className="topbar-model-badge" title={activeModelInfo?.description}>
              <Zap size={10} style={{ marginRight: '4px' }} />
              {activeModelInfo?.label}
            </div>
          </div>

          <div className="topbar-switcher-wrapper">
            <div className="topbar-switcher">
              <button 
                className={`switcher-btn ${view === 'copilot' ? 'active' : ''}`}
                onClick={() => setView('copilot')}
              >
                <div className="switcher-btn-content">
                  <MessageSquare size={14} />
                  <span>Innovestor Copilot</span>
                </div>
              </button>
              <button 
                className={`switcher-btn ${view === 'news' ? 'active' : ''}`}
                onClick={() => setView('news')}
              >
                <div className="switcher-btn-content">
                  <Newspaper size={14} />
                  <span>Startup News AI</span>
                </div>
              </button>
              <div className="switcher-pill-bg" style={{ left: view === 'copilot' ? '4px' : 'calc(50% + 2px)' }} />
            </div>
          </div>

          <div className="topbar-right">
            <button 
              className="clear-btn" 
              onClick={clearChat} 
              id="clear-chat-btn" 
              disabled={messages.length === 0}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* View Content Display */}
        <div className="view-container">
          <AnimatePresence mode="wait">
            {view === 'copilot' ? (
              <motion.div 
                key="copilot-view"
                className="view-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Chat Area */}
                <div className="chat-area">
                  <AnimatePresence mode="wait">
                    {messages.length === 0 && !showTyping ? (
                      <motion.div
                        key={activeMode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%' }}
                      >
                        <WelcomeScreen mode={currentMode} onModeChange={handleModeChange} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat-flow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ width: '100%' }}
                      >
                        {messages.map((m) => <MessageItem key={m.id} message={m} />)}
                        {showTyping && <TypingIndicator />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={`input-area ${messages.length === 0 ? 'centered' : ''}`}>
                  <div className="input-container">
                    <button className="input-action-btn" title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <textarea
                      ref={textareaRef}
                      className="chat-input"
                      placeholder="What's on your mind?"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      disabled={isStreaming}
                      id="chat-input"
                    />
                    
                    <div className="model-selector-wrapper">
                      <button 
                        className="auto-badge" 
                        onClick={() => setShowModelSelector(!showModelSelector)}
                        id="model-selector-btn"
                      >
                        <span className="model-btn-text">AI Models</span> <ChevronDown size={14} />
                      </button>
                      
                      <AnimatePresence>
                        {showModelSelector && (
                          <motion.div 
                            className="model-dropdown-popover"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                          >
                            <div className="popover-header">AI MODEL</div>
                            <div className="popover-list">
                              {GROQ_MODELS.map((model) => (
                                <button
                                  key={model.id}
                                  className={`popover-item ${activeModel === model.id ? 'active' : ''}`}
                                  onClick={() => {
                                    handleModelChange(model.id);
                                    setShowModelSelector(false);
                                  }}
                                >
                                  <div className="item-main">
                                    <Database size={16} className="item-icon" />
                                    <span className="item-label">{model.label}</span>
                                  </div>
                                  <span className="item-description">{model.description}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button className="input-action-btn" title="Voice input">
                      <Mic size={18} />
                    </button>

                    <button
                      className="send-btn-circle"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isStreaming}
                      id="send-btn"
                      title="Send message"
                    >
                      <div className="voice-wave">
                        <div className="wave-bar" style={{ height: '12px' }} />
                        <div className="wave-bar" style={{ height: '18px' }} />
                        <div className="wave-bar" style={{ height: '12px' }} />
                      </div>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {messages.length === 0 && (
                      <motion.div 
                        key={activeMode}
                        className="landed-suggestions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentMode.suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                          <button 
                            key={idx} 
                            className="landed-suggestion-btn"
                            onClick={() => handleSuggestion(prompt)}
                          >
                            {prompt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="news-view"
                className="view-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <NewsSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
