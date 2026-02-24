import { SPORTS_PROMPT, GAMES_PROMPT, NAVIGATE_PROMPT } from './system-prompt';

export type Mode = 'sports' | 'games' | 'navigate';

export interface ModeConfig {
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  useGoogleSearch: boolean;
}

export const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  sports: {
    systemPrompt: SPORTS_PROMPT,
    temperature: 0.2,
    maxOutputTokens: 300,
    topP: 0.85,
    topK: 25,
    useGoogleSearch: true,
  },
  games: {
    systemPrompt: GAMES_PROMPT,
    temperature: 0.1,
    maxOutputTokens: 100,
    topP: 0.8,
    topK: 20,
    useGoogleSearch: false,
  },
  navigate: {
    systemPrompt: NAVIGATE_PROMPT,
    temperature: 0.0,
    maxOutputTokens: 80,
    topP: 1,
    topK: 1,
    useGoogleSearch: false,
  },
};
