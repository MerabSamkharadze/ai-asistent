import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [GamesModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}