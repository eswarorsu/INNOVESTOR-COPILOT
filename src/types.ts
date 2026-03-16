export type Role = 'user' | 'model';

export type AgentMode =
  | 'general'
  | 'pitch-coach'
  | 'market-analyst'
  | 'investor-advisor'
  | 'due-diligence'
  | 'financial-planner';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  mode?: AgentMode;
  isStreaming?: boolean;
}

export interface AgentModeConfig {
  id: AgentMode;
  label: string;
  icon: string;
  description: string;
  systemPrompt: string;
  suggestedPrompts: string[];
  color: string;
}
