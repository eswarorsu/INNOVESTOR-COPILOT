import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { CircleUserRound } from 'lucide-react';
import type { Message } from '../types';
import AnimatedLogo from './AnimatedLogo';

interface MessageProps {
  message: Message;
}

const MessageItem: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Smooth streaming logic state
  const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
  const contentRef = React.useRef(message.content);

  // Sync the latest network content to a ref immediately so the animation loop can see it without restarting
  useEffect(() => {
    contentRef.current = message.content;
  }, [message.content]);

  useEffect(() => {
    if (isUser) {
      setDisplayedContent(message.content);
      return;
    }

    if (!message.isStreaming) {
      // Immediately finalize text when streaming stops
      setDisplayedContent(message.content);
      return;
    }

    // Single unbroken loop to drain characters from the ref
    let animationFrameId: number;
    const updateContent = () => {
      setDisplayedContent(prev => {
        const targetContent = contentRef.current;
        const diff = targetContent.length - prev.length;
        if (diff > 0) {
          const step = Math.max(1, Math.min(diff, Math.ceil(diff / 4)));
          return targetContent.slice(0, prev.length + step);
        }
        return prev;
      });
      animationFrameId = requestAnimationFrame(updateContent);
    };

    animationFrameId = requestAnimationFrame(updateContent);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isUser, message.isStreaming]); // Remove message.content from dependencies!

  return (
    <motion.div 
      className={`message-wrapper ${isUser ? 'user' : 'ai'}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`message-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <CircleUserRound size={20} /> : <AnimatedLogo isThinking={message.isStreaming} size={24} />}
      </div>
      <div className="message-body">
        <div className="message-meta">
          <span>{isUser ? 'You' : 'Copilot'}</span>
          <span>{time}</span>
        </div>
        <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
          {isUser ? (
            message.content
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
              {message.isStreaming && <span className="streaming-cursor" />}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;
