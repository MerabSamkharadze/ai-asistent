import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';
import { Mode, MODE_CONFIGS } from './helper/mode-configs';
import { GamesService } from '../games/games.service';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;
  private readonly chatSessions = new Map<string, Content[]>();

  constructor(
    private readonly configService: ConfigService,
    private readonly gamesService: GamesService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  generateStreamResponse(
    sessionId: string,
    userInput: string,
    mode: Mode = 'sports',
  ): Observable<{ data: string }> {
    return new Observable((subscriber) => {
      void this.stream(subscriber, sessionId, userInput, mode);
    });
  }

  clearHistory(sessionId: string) {
    this.chatSessions.delete(sessionId);
    return { message: `History cleared for session ${sessionId}` };
  }

  private async stream(
    subscriber: Subscriber<{ data: string }>,
    sessionId: string,
    userInput: string,
    mode: Mode,
  ): Promise<void> {
    try {
      const finalPrompt = await this.buildPrompt(userInput, mode);
      const history =
        mode === 'navigate' ? [] : (this.chatSessions.get(sessionId) ?? []);
      const userMessage: Content = {
        role: 'user',
        parts: [{ text: finalPrompt }],
      };
      const config = MODE_CONFIGS[mode];

      const streamGenerator = await this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        contents: [...history, userMessage],
        config: {
          tools: config.useGoogleSearch ? [{ googleSearch: {} }] : [],
          systemInstruction: { parts: [{ text: config.systemPrompt } as Part] },
          temperature: config.temperature,
          maxOutputTokens: config.maxOutputTokens,
          topP: config.topP,
          topK: config.topK,
          candidateCount: 1,
        },
      });

      let fullReply = '';
      for await (const chunk of streamGenerator) {
        if (chunk.text) {
          fullReply += chunk.text;
          subscriber.next({ data: chunk.text });
        }
      }

      if (mode !== 'navigate') {
        this.saveToHistory(sessionId, history, userInput, fullReply);
      }

      subscriber.next({ data: '[DONE]' });
      subscriber.complete();
    } catch (error: unknown) {
      this.logger.error('Stream error', error);
      subscriber.error(error);
    }
  }

  private async buildPrompt(userInput: string, mode: Mode): Promise<string> {
    if (mode !== 'games') return userInput;

    const allGames = await this.gamesService.fetchGames();
    const filtered = this.gamesService.filterByPrompt(allGames, userInput);
    return `მონაცემები:\n${JSON.stringify(filtered)}\n\nკითხვა: ${userInput}`;
  }

  private saveToHistory(
    sessionId: string,
    history: Content[],
    userInput: string,
    modelReply: string,
  ): void {
    this.chatSessions.set(sessionId, [
      ...history,
      { role: 'user', parts: [{ text: userInput }] },
      { role: 'model', parts: [{ text: modelReply }] },
    ]);
  }
}
