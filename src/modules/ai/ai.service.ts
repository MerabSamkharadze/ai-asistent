import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';
import { Mode, MODE_CONFIGS } from './helper/mode-configs';
import { GamesService } from '../games/games.service';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  private chatSessions: Map<string, Content[]> = new Map();

  constructor(
    private configService: ConfigService,
    private gamesService: GamesService,
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
      void (async () => {
        try {
          const config = MODE_CONFIGS[mode];

          let finalPrompt = userInput;

          if (mode === 'games') {
            const allGames = await this.gamesService.fetchGames();
            const filtered = this.gamesService.filterByPrompt(allGames, userInput);
            finalPrompt = `მონაცემები:\n${JSON.stringify(filtered)}\n\nკითხვა: ${userInput}`;
          }

          const currentHistory =
            mode === 'navigate' ? [] : this.chatSessions.get(sessionId) || [];

          // ისტორიაში ყოველთვის მხოლოდ userInput ვინახავთ (JSON გარეშე)
          const messageForHistory = { role: 'user', parts: [{ text: userInput }] };
          // Gemini-ზე კი finalPrompt გადის (games mode-ში JSON-ჩათვლით)
          const newUserMessage = { role: 'user', parts: [{ text: finalPrompt }] };

          const streamGenerator = await this.ai.models.generateContentStream({
            model: 'gemini-2.5-flash-lite',
            contents: [...currentHistory, newUserMessage],
            config: {
              tools: config.useGoogleSearch ? [{ googleSearch: {} }] : [],
              systemInstruction: {
                parts: [{ text: config.systemPrompt } as Part],
              },
              temperature: config.temperature,
              maxOutputTokens: config.maxOutputTokens,
              topP: config.topP,
              topK: config.topK,
              candidateCount: 1,
            },
          });

          let fullReply = '';

          for await (const chunk of streamGenerator) {
            const chunkText = chunk.text;
            if (chunkText) {
              fullReply += chunkText;
              subscriber.next({ data: chunkText });
            }
          }

          if (mode !== 'navigate') {
            const newModelMessage = {
              role: 'model',
              parts: [{ text: fullReply }],
            };
            this.chatSessions.set(sessionId, [
              ...currentHistory,
              messageForHistory,
              newModelMessage,
            ]);
          }

          subscriber.next({ data: '[DONE]' });
          subscriber.complete();
        } catch (error: unknown) {
          console.error('Stream Error:', error);
          subscriber.error(error);
        }
      })();
    });
  }

  clearHistory(sessionId: string) {
    this.chatSessions.delete(sessionId);
    return { message: 'History cleared for session ' + sessionId };
  }
}