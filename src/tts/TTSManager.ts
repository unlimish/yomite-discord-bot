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
    const text = this.queue.shift()!;
    try {
      const audioQuery = await postAudioQuery(text);
      const audio = await postSynthesis(audioQuery);
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
