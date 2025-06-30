import fetch from "node-fetch";
import { Readable } from "stream";
import { getSettings } from "../data/settings";

const API_URL = process.env.VOICEVOX_API_URL;

if (!API_URL) {
  throw new Error(
    "VOICEVOX_API_URL is not defined in the environment variables."
  );
}

export async function postAudioQuery(
  text: string,
  speaker = 1,
  guildId: string
): Promise<any> {
  const settings = getSettings(guildId);
  const response = await fetch(
    `${API_URL}/audio_query?text=${encodeURIComponent(
      text
    )}&speaker=${speaker}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to get audio query: ${response.statusText}`);
  }
  const audioQuery = await response.json();
  audioQuery.outputSamplingRate = settings.outputSamplingRate;
  return audioQuery;
}

export async function postSynthesis(
  audioQuery: any,
  speaker = 1
): Promise<Readable> {
  const response = await fetch(`${API_URL}/synthesis?speaker=${speaker}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(audioQuery),
  });
  if (!response.ok) {
    throw new Error(`Failed to synthesize audio: ${response.statusText}`);
  }
  return response.body as unknown as Readable;
}

export async function getSpeakers(): Promise<any[]> {
  const response = await fetch(`${API_URL}/speakers`);
  if (!response.ok) {
    throw new Error(`Failed to get speakers: ${response.statusText}`);
  }
  return response.json();
}
