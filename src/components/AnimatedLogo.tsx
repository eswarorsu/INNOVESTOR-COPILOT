import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface AnimatedLogoProps {
  isThinking?: boolean;
  size?: number | string;
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  isThinking = false, 
  size = 40,
  className = ""
}) => {
  // Container rotation animation
  const containerVariants: Variants = {
    thinking: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    },
    static: { rotate: 0 }
  };

  // Node and Bond "in and out" animation
  const nodeVariants: Variants = {
    thinking: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    static: { scale: 1 }
  };

  // Individual node offsets to create a more organic feel
  const node2Variants: Variants = {
    thinking: {
      scale: [1, 1.15, 1],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.2
      }
    },
    static: { scale: 1 }
  };

  const node3Variants: Variants = {
    thinking: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.4
      }
    },
    static: { scale: 1 }
  };

  return (
    <div className={`animated-logo-container ${className}`} style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        variants={containerVariants}
        animate={isThinking ? "thinking" : "static"}
        style={{ overflow: 'visible' }}
      >
        {/* Center Node */}
        <circle cx="50" cy="50" r="5" fill="currentColor" />

        {/* Branch 1 - Top Left */}
        <motion.g variants={nodeVariants}>
          <line x1="50" y1="50" x2="25" y2="30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="25" cy="30" r="18" fill="white" stroke="currentColor" strokeWidth="4" />
          {/* Highlight path */}
          <path 
            d="M 15 28 A 10 10 0 0 1 25 18" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </motion.g>

        {/* Branch 2 - Right */}
        <motion.g variants={node2Variants}>
          <line x1="50" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="80" cy="50" r="22" fill="white" stroke="currentColor" strokeWidth="4" />
          {/* Highlight path */}
          <path 
            d="M 70 48 A 12 12 0 0 1 80 36" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
        </motion.g>

        {/* Branch 3 - Bottom Left */}
        <motion.g variants={node3Variants}>
          <line x1="50" y1="50" x2="35" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="35" cy="80" r="18" fill="white" stroke="currentColor" strokeWidth="4" />
          {/* Highlight path */}
          <path 
            d="M 25 78 A 10 10 0 0 1 35 68" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default AnimatedLogo;
