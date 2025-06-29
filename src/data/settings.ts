import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const dataDir = join(__dirname, "..", "..", "data");

export type URLHandling = "read" | "skip" | "domain";

export interface VoiceSettings {
  speaker: number;
  speed: number;
  pitch: number;
  urlHandling: URLHandling;
  ignoredPrefixes: string[];
}

const defaultSettings: VoiceSettings = {
  speaker: 1, // Default speaker ID
  speed: 1.0,
  pitch: 0,
  urlHandling: "read",
  ignoredPrefixes: [],
};

function getSettingsPath(guildId: string): string {
  const guildDir = join(dataDir, guildId);
  if (!existsSync(guildDir)) {
    mkdirSync(guildDir, { recursive: true });
  }
  return join(guildDir, "settings.json");
}

export function getSettings(guildId: string): VoiceSettings {
  const path = getSettingsPath(guildId);
  if (!existsSync(path)) {
    return defaultSettings;
  }
  const data = readFileSync(path, "utf-8");
  return { ...defaultSettings, ...JSON.parse(data) };
}

export function saveSettings(
  guildId: string,
  settings: Partial<VoiceSettings>
): void {
  const currentSettings = getSettings(guildId);
  const newSettings = { ...currentSettings, ...settings };
  const path = getSettingsPath(guildId);
  writeFileSync(path, JSON.stringify(newSettings, null, 2));
}
