import { IsString, IsNotEmpty } from 'class-validator'; // თუ იყენებ ვალიდაციას

export class AskAiDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string; // <--- ეს დაამატე
}
