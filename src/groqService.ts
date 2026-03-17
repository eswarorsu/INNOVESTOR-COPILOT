import Groq from 'groq-sdk';
import type { AgentMode } from './types';
import { getMode } from './agentModes';

export type GroqModel =
  | 'auto'
  | 'groq/compound'
  | 'groq/compound-mini'
  | 'openai/gpt-oss-20b'
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile';

export const GROQ_MODELS: { id: GroqModel; label: string; description: string }[] = [
  { id: 'auto', label: 'Auto (Recommended)', description: 'AI-powered routing · Best model for your query' },
  { id: 'groq/compound', label: 'Groq Compound', description: 'Advanced system · Optimal for tool-use & complex reasoning' },
  { id: 'groq/compound-mini', label: 'Groq Compound Mini', description: 'Lightweight & fast · Best for low-latency agentic tasks' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', description: 'Efficient MoE · High performance for agentic workflows' },
  { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B', description: 'Ultra-fast inference · Best for simple, quick answers' },
  { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B', description: 'Legacy capability · Best for robust general reasoning' },
];

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GroqService {
  private client: Groq | null = null;
  private apiKey: string = import.meta.env.VITE_GROQ_API_KEY || '';
  private histories: Map<AgentMode, HistoryMessage[]> = new Map();
  private selectedModel: GroqModel = 'auto';

  private ROUTER_PROMPT = `You are an AI routing system for Innovestor Copilot.
Your job is to analyze the user's query and decide which AI model should handle it.

Available models:
1. groq/compound-mini → very fast, for simple questions and quick answers
2. groq/compound → advanced agent model, for deep analysis, research, and multi-step reasoning
3. llama-3.3-70b-versatile → strong reasoning model for detailed explanations, strategies, and structured outputs
4. openai/gpt-oss-20b → balanced model for medium complexity queries
5. llama-3.1-8b-instant → fallback model for basic responses

Routing rules:
* SIMPLE (basic questions, short answers, casual chat) → groq/compound-mini
* MEDIUM (explanations, longer responses, moderate reasoning) → openai/gpt-oss-20b
* COMPLEX (startup analysis, market research, business strategy, comparisons) → llama-3.3-70b-versatile
* AGENT / DEEP (multi-step tasks, detailed reports, deep research) → groq/compound

Additional rules:
* If the query mentions words like "analyze", "strategy", "market", "valuation", "compare", "roadmap", "funding" → prefer COMPLEX or AGENT
* If the query is very long or asks for step-by-step or detailed report → choose AGENT
* If unsure → default to groq/compound-mini

Output format (STRICT):
Return ONLY the model name, nothing else.`;

  constructor() {
    if (this.apiKey) {
      this.initialize(this.apiKey);
    }
  }

  initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Groq({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.histories.clear();
  }

  isInitialized(): boolean {
    return this.client !== null && this.apiKey !== '';
  }

  setModel(model: GroqModel) {
    this.selectedModel = model;
  }

  getModel(): GroqModel {
    return this.selectedModel;
  }

  private getHistory(mode: AgentMode): HistoryMessage[] {
    if (!this.histories.has(mode)) {
      this.histories.set(mode, []);
    }
    return this.histories.get(mode)!;
  }

  async routeQuery(query: string): Promise<GroqModel> {
    if (!this.client) return 'groq/compound-mini';

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: this.ROUTER_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: 0,
        max_tokens: 20
      });

      const routedModel = completion.choices[0]?.message?.content?.trim() as GroqModel;
      // Validate the response is a valid model ID
      const isValid = GROQ_MODELS.some(m => m.id === routedModel && m.id !== 'auto');
      return isValid ? routedModel : 'groq/compound-mini';
    } catch (err) {
      console.error('[GroqService] Routing error:', err);
      return 'groq/compound-mini';
    }
  }

  async sendMessageStream(
    message: string,
    mode: AgentMode,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void
  ) {
    if (!this.client) {
      onError('Groq client not initialized. Please enter your API key.');
      return;
    }

    const modeConfig = getMode(mode);
    const history = this.getHistory(mode);

    // Append user message to history
    history.push({ role: 'user', content: message });

    try {
      let finalModel = this.selectedModel;
      
      // AI Routing logic
      if (this.selectedModel === 'auto') {
        finalModel = await this.routeQuery(message);
        console.log(`[GroqService] Auto-routed to: ${finalModel}`);
      }

      const messages = [
        { role: 'system' as const, content: modeConfig.systemPrompt },
        ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      ];

      const stream = await this.client.chat.completions.create({
        model: finalModel === 'auto' ? 'groq/compound-mini' : finalModel,
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 4096,
        top_p: 0.95,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) {
          fullResponse += text;
          onChunk(text);
        }
      }

      // Append assistant response to history
      history.push({ role: 'assistant', content: fullResponse });
      onDone();
    } catch (err: any) {
      // Remove the user message we added since it failed
      history.pop();
      console.error('[GroqService] Error:', err);
      onError(err?.error?.message ?? err?.message ?? 'An unknown error occurred');
    }
  }

  clearSession(mode: AgentMode) {
    this.histories.delete(mode);
  }

  clearAllSessions() {
    this.histories.clear();
  }
}

export const groqService = new GroqService();
