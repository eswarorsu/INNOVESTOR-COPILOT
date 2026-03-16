import Groq from 'groq-sdk';
import type { AgentMode } from './types';
import { getMode } from './agentModes';

export type GroqModel =
  | 'llama-3.3-70b-versatile'
  | 'llama3-8b-8192'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it';

export const GROQ_MODELS: { id: GroqModel; label: string; description: string }[] = [
  { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B', description: 'Most capable · Best for complex analysis' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'Great reasoning · 32K context' },
  { id: 'llama3-8b-8192', label: 'LLaMA 3 8B', description: 'Ultra-fast · Best for quick answers' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B', description: 'Google-trained · Efficient & precise' },
];

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GroqService {
  private client: Groq | null = null;
  private apiKey: string = import.meta.env.VITE_GROQ_API_KEY || '';
  private histories: Map<AgentMode, HistoryMessage[]> = new Map();
  private selectedModel: GroqModel = 'llama-3.3-70b-versatile';

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

    const messages = [
      { role: 'system' as const, content: modeConfig.systemPrompt },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    ];

    try {
      const stream = await this.client.chat.completions.create({
        model: this.selectedModel,
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
