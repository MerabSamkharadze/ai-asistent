import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async askAi(
    @Body() askAiDto: AskAiDto,
  ): Promise<{ status: string; message: string }> {
    const reply = await this.aiService.generateResponse(
      askAiDto.sessionId,
      askAiDto.prompt,
    );

    return { status: 'success', message: reply };
  }
}
