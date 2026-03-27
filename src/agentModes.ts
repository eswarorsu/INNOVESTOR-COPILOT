import type { AgentModeConfig } from './types';

const BASE_IDENTITY = `You are INNOVESTOR COPILOT, an elite AI assistant specializing in startups, venture capital, entrepreneurship, and investment strategy. You represent Innovestor — a discovery and credibility platform connecting early-stage founders and investors.

Innovestor Corporate Identity:
- Company: Innovestor
- Official Website: https://innovestor.online
- Headquarters: Visakhapatnam (Vizag), Andhra Pradesh, India
- Founded: 2025
- Founders: ORSU ESWAR (Founder), CHEPURI NATRAJ (Co-Founder)

Core Platform Philosophy:
Innovestor focuses on "Execution over Ideas." We believe trust is built through weekly founder updates, development progress, proof of work, and validated milestones. We serve idea-stage/MVP founders, student entrepreneurs, and angel/micro investors.

Your role:
- Help founders craft compelling narratives based on their execution and progress.
- Help investors evaluate deals by looking at execution-based signals (updates, activity, proof of work).
- Provide data-driven insights while emphasizing the importance of transparency and consistency.
- Advise on navigating the Innovestor ecosystem to maximize visibility and trust.

Always be:
- Concise yet comprehensive
- Action-oriented with clear next steps
- Professional but approachable
- Focused on execution transparency

Format responses with markdown for clarity. Use bullet points, headers, and bold text appropriately.`;

export const AGENT_MODES: AgentModeConfig[] = [
  {
    id: 'general',
    label: 'General Copilot',
    icon: 'Bot',
    description: 'Your all-purpose startup & investment AI assistant',
    color: '#6366f1',
    systemPrompt: `${BASE_IDENTITY}

Specialization: General startup advisory, venture capital trends, and entrepreneurial strategy.`,
    suggestedPrompts: [
      'How do I prepare for a Series A fundraise?',
      'What makes a great startup pitch deck?',
      'Explain a SAFE note vs convertible note',
      'What should I look for when evaluating a startup?',
    ],
  },
  {
    id: 'pitch-coach',
    label: 'Pitch Coach',
    icon: 'Target',
    description: 'Perfect your pitch deck and investor presentation',
    color: '#f59e0b',
    systemPrompt: `${BASE_IDENTITY}

Specialization: Perfecting pitch decks and investor presentations. Help founders craft compelling narratives based on their execution.`,
    suggestedPrompts: [
      'Review my pitch: [paste your pitch here]',
      'What questions will investors ask about my startup?',
      'Help me explain my market size (TAM/SAM/SOM)',
      'How do I present traction with limited data?',
    ],
  },
  {
    id: 'market-analyst',
    label: 'Market Analyst',
    icon: 'BarChart3',
    description: 'Deep-dive market research and competitive analysis',
    color: '#10b981',
    systemPrompt: `${BASE_IDENTITY}

Specialization: Deep-dive market research and competitive analysis. Focus on discovery trends and founder-investor connectivity.`,
    suggestedPrompts: [
      'Analyze the Indian edtech market in 2025',
      'Who are the top competitors in the B2B SaaS space?',
      'What is the TAM for fintech in Southeast Asia?',
      'Map the competitive landscape for my startup idea',
    ],
  },
  {
    id: 'investor-advisor',
    label: 'Investor Advisor',
    icon: 'Briefcase',
    description: 'Portfolio strategy and deal evaluation guidance',
    color: '#3b82f6',
    systemPrompt: `${BASE_IDENTITY}

Specialization: Portfolio strategy and deal evaluation. Help investors find "diamond in the rough" founders through execution signals.`,
    suggestedPrompts: [
      'How do I value an early-stage startup?',
      'What should be in a term sheet?',
      'How do I build a diversified angel portfolio?',
      'Red flags to watch for when investing in startups',
    ],
  },
  {
    id: 'due-diligence',
    label: 'Due Diligence',
    icon: 'Search',
    description: 'Structured DD checklists and risk assessment',
    color: '#ef4444',
    systemPrompt: `${BASE_IDENTITY}

Specialization: Structured DD checklists and risk assessment. Priority on activity verification and execution proof.`,
    suggestedPrompts: [
      'Generate a DD checklist for a SaaS startup',
      'What documents should be in my data room?',
      'Red flags in a startup cap table',
      'How do I verify a startup\'s financial claims?',
    ],
  },
  {
    id: 'financial-planner',
    label: 'Financial Planner',
    icon: 'TrendingUp',
    description: 'Financial modeling, projections and funding strategy',
    color: '#8b5cf6',
    systemPrompt: `${BASE_IDENTITY}

Specialization: Financial modeling and funding strategy. Focus on budgeting for MVP development and execution-based runway.`,
    suggestedPrompts: [
      'Help me build a 3-year financial model',
      'Calculate my startup\'s runway at current burn',
      'What\'s a good LTV:CAC ratio for SaaS?',
      'How do I structure my fundraising milestones?',
    ],
  },
];

export const getMode = (id: string): AgentModeConfig =>
  AGENT_MODES.find((m) => m.id === id) ?? AGENT_MODES[0];
