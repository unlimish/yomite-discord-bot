import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { Guild } from "discord.js";
import { postAudioQuery, postSynthesis } from "./voicevox.js";
import { getDictionary } from "../data/dictionary";
import { getSettings } from "../data/settings";

export class TTSManager {
  private static instances = new Map<string, TTSManager>();
  private player: AudioPlayer;
  private queue: string[] = [];
  private isPlaying = false;

  private constructor(private guild: Guild) {
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.isPlaying = false;
      this.playNext();
    });

    const connection = getVoiceConnection(this.guild.id);
    if (connection) {
      connection.subscribe(this.player);
    }
  }

  public static getInstance(guild: Guild): TTSManager {
    if (!TTSManager.instances.has(guild.id)) {
      TTSManager.instances.set(guild.id, new TTSManager(guild));
    }
    return TTSManager.instances.get(guild.id)!;
  }

  public addToQueue(text: string) {
    this.queue.push(text);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      return;
    }
    this.isPlaying = true;
    let text = this.queue.shift()!;

    const dictionary = getDictionary(this.guild.id);
    for (const word in dictionary) {
      text = text.replace(new RegExp(word, "g"), dictionary[word]);
    }

    try {
      const settings = getSettings(this.guild.id);
      const audioQuery = await postAudioQuery(text, settings.speaker);
      audioQuery.speed = settings.speed;
      audioQuery.pitch = settings.pitch;
      const audio = await postSynthesis(audioQuery, settings.speaker);
      const resource = createAudioResource(audio);
      this.player.play(resource);
    } catch (error) {
      console.error("Error during TTS playback:", error);
      this.isPlaying = false;
      this.playNext(); // Try next item in queue
    }
  }

  public stop() {
    this.queue = [];
    this.player.stop(true);
    TTSManager.instances.delete(this.guild.id);
  }
}
