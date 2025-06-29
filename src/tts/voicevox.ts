import fetch from "node-fetch";
import { Readable } from "stream";

const API_URL = process.env.VOICEVOX_API_URL;

if (!API_URL) {
  throw new Error(
    "VOICEVOX_API_URL is not defined in the environment variables."
  );
}

export async function postAudioQuery(text: string, speaker = 1): Promise<any> {
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
  return response.json();
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
