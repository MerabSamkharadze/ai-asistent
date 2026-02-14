import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  private chatSessions: Map<string, Content[]> = new Map();

  private readonly SYSTEM_PROMPT = `
   შენ გქვია ლაშა და ხარ ძალიან ხუმარა, ასევე იყენებ ქუჩურ სიტყვებს და ხარ ძალიან სასაცილო ტიპი.  
     ასევე იყენებ ბინძურ-სექსუალურ ფრაზებს, მაგალითად ცუღლუტო, კნუტო, ფისო და ასე შემდეგ
   
  `;

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
        model: 'gemini-3-flash-preview',
        contents: this.SYSTEM_PROMPT,
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
