import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';
import { SYSTEM_PROMPT } from './system-prompt';

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

  async generateResponse(
    sessionId: string,
    userInput: string,
  ): Promise<string> {
    try {
      const currentHistory = this.chatSessions.get(sessionId) || [];

      const newUserMessage: Content = {
        role: 'user',
        parts: [{ text: userInput } as Part],
      };

      const fullConversation = [...currentHistory, newUserMessage];

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullConversation,
        config: {
          tools: [
            {
              googleSearch: {},
            },
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT } as Part],
          },
        },
      });

      const responseText = response.text ?? 'პასუხი ვერ მოიძებნა.';

      const newModelMessage: Content = {
        role: 'model',
        parts: [{ text: responseText } as Part],
      };

      this.chatSessions.set(sessionId, [...fullConversation, newModelMessage]);

      return responseText;
    } catch (error: any) {
      console.error('Gemini SDK Error:', error);
      throw new InternalServerErrorException(`AI Error: ${error.message}`);
    }
  }
  clearHistory(sessionId: string) {
    this.chatSessions.delete(sessionId);
    return { message: 'History cleared for session ' + sessionId };
  }
}
