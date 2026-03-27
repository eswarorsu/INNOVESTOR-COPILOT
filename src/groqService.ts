import Groq from 'groq-sdk';
import type { AgentMode } from './types';
import { getMode } from './agentModes';

export type GroqModel =
  | 'auto'
  | 'groq/compound'
  | 'groq/compound-mini'
  | 'nvidia/nemotron-3-super-120b-a12b:free'
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile';

export const GROQ_MODELS: { id: GroqModel; label: string; description: string }[] = [
  { id: 'auto', label: 'Auto (Recommended)', description: 'AI-powered routing · Best model for your query' },
  { id: 'groq/compound', label: 'Groq Compound', description: 'Advanced system · Optimal for tool-use & complex reasoning' },
  { id: 'groq/compound-mini', label: 'Groq Compound Mini', description: 'Lightweight & fast · Best for low-latency agentic tasks' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 120B Super', description: 'Nvidia Deep Reasoning · Deep high-value queries' },
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
  private openRouterKey: string = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  private histories: Map<AgentMode, HistoryMessage[]> = new Map();
  private selectedModel: GroqModel = 'auto';

  private ROUTER_PROMPT = `You are an AI routing system for Innovestor Copilot (innovestor.online).
Innovestor is a discovery platform founded in 2025 by ORSU ESWAR (Founder) and CHEPURI NATRAJ (Co-Founder) from Visakhapatnam, AP.
The mission is "Execution over Ideas" — connecting founders and investors through transparency and proof of work.

Your job is to analyze the user's query and decide which AI model should handle it.

Available models:
1. groq/compound-mini → very fast, for simple questions and quick answers
2. groq/compound → advanced agent model, for deep analysis, research, and multi-step reasoning
3. llama-3.3-70b-versatile → strong reasoning model for detailed explanations, strategies, and structured outputs
4. nvidia/nemotron-3-super-120b-a12b:free → deep reasoning for high-value queries
5. llama-3.1-8b-instant → fallback model for basic responses

Routing rules:
* SIMPLE (basic questions, short answers, casual chat) → groq/compound-mini
* MEDIUM (explanations, longer responses, moderate reasoning) → nvidia/nemotron-3-super-120b-a12b:free
* COMPLEX (startup analysis, market research, business strategy, comparisons) → llama-3.3-70b-versatile
* AGENT / DEEP (multi-step tasks, detailed reports, deep research) → groq/compound

Additional rules:
* If the query mentions words like "analyze", "strategy", "market", "valuation", "compare", "roadmap", "funding" → prefer COMPLEX or AGENT
* If the query is or mentions the founders "Orsu Eswar" or "Natraj" or "Innovestor" → Use groq/compound-mini for quick identification unless a deeper analysis is requested.
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

      const globalFormattingRules = `
CRITICAL FORMATTING RULES:
- Never output Markdown tables.
- Structure complex data using a clear hierarchy: Title (##), Subtitle (###), Bullet Points, and Examples.
- Keep the output readable and well-grouped so a user feels it is easy to read.`;

      const messages = [
        { role: 'system' as const, content: modeConfig.systemPrompt + globalFormattingRules },
        ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      ];

      // Handle OpenRouter for Nemotron
      if (finalModel === 'nvidia/nemotron-3-super-120b-a12b:free') {
        if (!this.openRouterKey) {
          throw new Error('OpenRouter API key missing');
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Innovestor Copilot"
          },
          body: JSON.stringify({
            model: finalModel,
            messages,
            stream: true,
          })
        });

        if (!response.ok) throw new Error('OpenRouter integration failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || "";
                  if (content) {
                    fullResponse += content;
                    onChunk(content);
                  }
                } catch (e) {}
              }
            }
          }
        }
        
        history.push({ role: 'assistant', content: fullResponse });
        onDone();
        return;
      }

      // Map pseudo-models to actual high-speed Groq models to ensure rapid inference
      const modelMapping: Record<string, string> = {
        'groq/compound': 'llama-3.3-70b-versatile',
        'groq/compound-mini': 'llama-3.1-8b-instant',
        'auto': 'llama-3.1-8b-instant'
      };
      const mappedModel = modelMapping[finalModel] || finalModel;

      const stream = await this.client.chat.completions.create({
        model: mappedModel,
        messages,
        stream: true,
        temperature: 0.2, // Lowered from 0.8 for highly accurate responses
        max_tokens: 3000, // Reduced for faster completion and fewer long timeouts
        top_p: 0.85,      // Tighter sampling for precise answers
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
