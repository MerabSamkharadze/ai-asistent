import {
  Controller,
  Delete,
  Param,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Sse('ask-stream')
  askAiStream(@Query() dto: AskAiDto): Observable<MessageEvent> {
    return this.aiService.generateStreamResponse(dto.sessionId, dto.prompt).pipe(
      map((chunk) => ({ data: chunk.data }) as MessageEvent),
    );
  }

  @Delete('history/:sessionId')
  clearHistory(@Param('sessionId') sessionId: string) {
    return this.aiService.clearHistory(sessionId);
  }
}