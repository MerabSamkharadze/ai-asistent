import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(private configService: ConfigService) {}

  async fetchGames(): Promise<unknown> {
    const apiUrl = this.configService.get<string>('GAMES_API_URL');

    if (!apiUrl) {
      this.logger.warn('GAMES_API_URL არ არის კონფიგურირებული');
      return [];
    }

    let response: Response;
    try {
      response = await fetch(apiUrl);
    } catch {
      this.logger.error('Games API-თან კავშირი ვერ დამყარდა');
      return [];
    }

    if (!response.ok) {
      this.logger.error(`Games API error: ${response.status}`);
      return [];
    }

    return response.json();
  }

  filterByPrompt(games: unknown, prompt: string): unknown {
    if (!Array.isArray(games)) return games;

    const keywords = prompt.toLowerCase().split(/\s+/);

    const filtered = games.filter((game) => {
      const gameStr = JSON.stringify(game).toLowerCase();
      return keywords.some(
        (keyword) => keyword.length > 2 && gameStr.includes(keyword),
      );
    });

    // თუ ფილტრმა ვერაფერი იპოვა, პირველი 10 ჩანაწერი დავაბრუნოთ
    return filtered.length > 0 ? filtered : games.slice(0, 10);
  }
}
