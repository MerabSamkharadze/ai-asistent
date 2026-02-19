import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class AskAiDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsOptional()
  @IsIn(['sports', 'games', 'navigate'])
  mode?: 'sports' | 'games' | 'navigate';
}