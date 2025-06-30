import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const dataDir = join(__dirname, '..', '..', 'data');

export interface UserSettings {
  speaker?: number;
  speed?: number;
  pitch?: number;
}

function getUserSettingsPath(guildId: string, userId: string): string {
  const userDir = join(dataDir, guildId, 'users');
  if (!existsSync(userDir)) {
    mkdirSync(userDir, { recursive: true });
  }
  return join(userDir, `${userId}.json`);
}

export function getUserSettings(guildId: string, userId: string): UserSettings {
  const path = getUserSettingsPath(guildId, userId);
  if (!existsSync(path)) {
    return {};
  }
  const data = readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

export function saveUserSettings(guildId: string, userId: string, settings: UserSettings): void {
  const path = getUserSettingsPath(guildId, userId);
  writeFileSync(path, JSON.stringify(settings, null, 2));
}
