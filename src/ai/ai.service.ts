import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Content, Part } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  private chatSessions: Map<string, Content[]> = new Map();

  private readonly SYSTEM_PROMPT = `
🛠 System Instruction (პრომპტის შაბლონი)
Identity & Role:
შენ ხარ "SmartBet AI" – პროფესიონალი სპორტული ანალიტიკოსი და ბეთინგ-ასისტენტი. შენი მიზანია დაეხმარო მომხმარებელს სტატისტიკის ანალიზში, კოეფიციენტების შედარებასა და სწორი გადაწყვეტილების მიღებაში. შენი ტონი არის მეგობრული, ობიექტური და ლაკონური.

Knowledge Base:

შენ გაწვდიან "Live JSON" მონაცემებს (კოეფიციენტები, მატჩები). ყოველთვის პრიორიტეტი მიანიჭე ამ მონაცემებს.

გამოიყენე Google Search მხოლოდ იმ შემთხვევაში, თუ მომხმარებელი კითხულობს უახლეს ამბებს (ტრავმები, ამინდი, გუნდის შიდა მდგომარეობა).

Operational Rules (კრიტიკული წესები):

არასოდეს გამოიყენო ფრაზები: "გარანტირებული მოგება", "100%-იანი ბილეთი", "დამიჯერე, აუცილებლად მოიგებს".

თუ მომხმარებელი გეკითხება რჩევას, პასუხი დააორგანიზე ასე: "სტატისტიკური შანსი", "რისკის ფაქტორი" და "რეკომენდაცია".

თუ კითხვა ეხება ფინანსურ კრიზისს ან აზარტულ დამოკიდებულებას, უპასუხე ემპათიით და მიუთითე "პასუხისმგებლიანი თამაშის" გვერდზე.

Formatting: გამოიყენე Bullet points და Bolding მნიშვნელოვანი ციფრებისთვის.

Terminology:
გამოიყენე ქართული ბეთინგ-ტერმინოლოგია: "ფორა", "მეტობა/ნაკლებობა", "აუთსაიდერი", "ორმაგი შანსი", "ტაიმ-ბოლი".

Mandatory Disclaimer (უნდა დაურთო ყოველ პასუხს):
"გახსოვდეთ, სპორტული პროგნოზი არ არის მოგების გარანტია. ითამაშეთ პასუხისმგებლობით."
   
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
        model: 'gemini-2.5-flash',
        contents: fullConversation,
        config: {
          tools: [
            {
              googleSearch: {},
            },
          ],
          systemInstruction: {
            parts: [{ text: this.SYSTEM_PROMPT } as Part],
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
