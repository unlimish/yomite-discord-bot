import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dataDir = join(__dirname, "..", "..", "data");

interface Dictionary {
  [word: string]: string;
}

function getDictionaryPath(guildId: string): string {
  const guildDir = join(dataDir, guildId);
  if (!existsSync(guildDir)) {
    // mkdirSync(guildDir, { recursive: true });
  }
  return join(guildDir, "dictionary.json");
}

export function getDictionary(guildId: string): Dictionary {
  const path = getDictionaryPath(guildId);
  if (!existsSync(path)) {
    return {};
  }
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data);
}

export function addWord(guildId: string, word: string, reading: string): void {
  const dictionary = getDictionary(guildId);
  dictionary[word] = reading;
  const path = getDictionaryPath(guildId);
  writeFileSync(path, JSON.stringify(dictionary, null, 2));
}

export function removeWord(guildId: string, word: string): void {
  const dictionary = getDictionary(guildId);
  delete dictionary[word];
  const path = getDictionaryPath(guildId);
  writeFileSync(path, JSON.stringify(dictionary, null, 2));
}
