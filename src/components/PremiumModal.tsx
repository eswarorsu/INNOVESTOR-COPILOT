import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-overlay" onClick={onClose}>
          <motion.div 
            className="auth-premium-card premium-limit-card" 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
          >
            <div className="flex justify-end p-2">
              <button onClick={onClose} className="auth-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="premium-logo-glow">
                  <Crown size={48} className="text-yellow-400" />
                </div>
              </div>
              
              <h2 className="modal-title text-3xl mb-2">Upgrade to Premium</h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                You've reached your free usage limit of 6 queries. 
                Unlock unlimited access, faster responses, and advanced intelligence.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3 text-white/70 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                  <Zap size={16} className="text-yellow-400" />
                  <span>Unlimited High-Speed AI Queries</span>
                </div>
                <div className="flex items-center gap-3 text-white/70 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
                  <ShieldCheck size={16} className="text-blue-400" />
                  <span>Priority Access to Latest Models</span>
                </div>
              </div>

              <button className="modal-btn w-full flex items-center justify-center gap-2 group">
                <span>Start Premium Trial</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={onClose}
                className="mt-4 text-xs uppercase tracking-widest text-white/30 hover:text-white/60 transition-all font-bold"
              >
                Close and return
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
