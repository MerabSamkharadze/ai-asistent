import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';
import { SYSTEM_PROMPT } from './helper/system-prompt';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  private chatSessions: Map<string, Content[]> = new Map();

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  generateStreamResponse(
    sessionId: string,
    userInput: string,
  ): Observable<{ data: string }> {
    return new Observable((subscriber) => {
      // ვიყენებთ თვით-გამომძახებელ ასინქრონულ ფუნქციას
      (async () => {
        try {
          const currentHistory = this.chatSessions.get(sessionId) || [];
          const newUserMessage = { role: 'user', parts: [{ text: userInput }] };

          // 1. ვიღებთ ასინქრონულ გენერატორს
          const streamGenerator = await this.ai.models.generateContentStream({
            model: 'gemini-2.5-flash-lite',
            contents: [...currentHistory, newUserMessage],
            config: {
              tools: [
                {
                  googleSearch: {},
                },
              ],
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT } as Part],
              },
              temperature: 0.2,
              maxOutputTokens: 600,
              topP: 0.85,
              topK: 25,
              candidateCount: 1,
            },
          });

          let fullReply = '';

          // 2. ვკითხულობთ ჩანქებს გენერატორიდან
          for await (const chunk of streamGenerator) {
            // ზოგიერთ ვერსიაში chunk.text() ფუნქციაა, ზოგში პროპერთი
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const chunkText =
              typeof chunk.text === 'function'
                ? chunk.text()
                : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  (chunk as any).text;

            if (chunkText) {
              fullReply += chunkText;
              // ვაწვდით SSE-ს თითოეულ ნაწილს
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              subscriber.next({ data: chunkText });
            }
          }

          // 3. ისტორიის შენახვა
          const newModelMessage = {
            role: 'model',
            parts: [{ text: fullReply }],
          };
          this.chatSessions.set(sessionId, [
            ...currentHistory,
            newUserMessage,
            newModelMessage,
          ]);

          // 4. დასრულების სიგნალი
          subscriber.next({ data: '[DONE]' });
          subscriber.complete();
        } catch (error: any) {
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
