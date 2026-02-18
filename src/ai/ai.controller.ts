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

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 1. სტრიმინგის ენდფოინთი
  @Sse('ask-stream')
  askAiStream(
    @Query('prompt') prompt: string,
    @Query('sessionId') sessionId: string,
  ): Observable<MessageEvent> {
    return this.aiService.generateStreamResponse(sessionId, prompt).pipe(
      map(
        (chunk) =>
          ({
            data: chunk.data,
          }) as MessageEvent,
      ),
    );
  }

  // 2. ისტორიის წაშლის ენდფოინთი
  @Delete('history/:sessionId')
  clearHistory(@Param('sessionId') sessionId: string) {
    return this.aiService.clearHistory(sessionId);
  }
}
