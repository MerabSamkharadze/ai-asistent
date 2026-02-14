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

      // 1. ვქმნით იუზერის ახალ მესიჯს
      const newUserMessage: Content = {
        role: 'user',
        parts: [{ text: userInput } as Part],
      };

      // 2. ვაერთიანებთ ისტორიას და ახალ მესიჯს
      const fullConversation = [...currentHistory, newUserMessage];

      // 3. სწორი მოთხოვნა: contents არის საუბარი, config არის ინსტრუქცია
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullConversation, // აქ უნდა მიდიოდეს იუზერის ნათქვამი!
        config: {
          systemInstruction: {
            parts: [{ text: this.SYSTEM_PROMPT } as Part],
          },
        },
      });

      const responseText = response.text ?? 'პასუხი ვერ მოიძებნა.';

      // 4. ვინახავთ პასუხს ისტორიაში
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
