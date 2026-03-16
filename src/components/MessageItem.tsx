import React from 'react';
import ReactMarkdown from 'react-markdown';
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
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.isStreaming && <span className="streaming-cursor" />}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;
