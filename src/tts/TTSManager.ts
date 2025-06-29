import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
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
  private autoLeaveTimeout: NodeJS.Timeout | null = null;

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
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
          // Seems to be a real disconnect which SHOULDN'T be recovered from
          connection.destroy();
        }
      });
    }
    this.resetAutoLeaveTimeout();
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
    this.resetAutoLeaveTimeout();
  }

  private async playNext() {
    if (this.queue.length === 0) {
      return;
    }
    this.isPlaying = true;
    let text = this.queue.shift()!;
    const settings = getSettings(this.guild.id);

    // Ignored prefixes
    for (const prefix of settings.ignoredPrefixes) {
      if (text.startsWith(prefix)) {
        this.isPlaying = false;
        this.playNext();
        return;
      }
    }

    // URL handling
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      switch (settings.urlHandling) {
        case "skip":
          this.isPlaying = false;
          this.playNext();
          return;
        case "domain":
          text = text.replace(urlRegex, (url) => new URL(url).hostname);
          break;
        case "read":
          text = text.replace(urlRegex, "URL");
          break;
      }
    }

    const dictionary = getDictionary(this.guild.id);
    for (const word in dictionary) {
      text = text.replace(new RegExp(word, "g"), dictionary[word]);
    }

    try {
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
    if (this.autoLeaveTimeout) {
      clearTimeout(this.autoLeaveTimeout);
    }
  }

  public resetAutoLeaveTimeout() {
    if (this.autoLeaveTimeout) {
      clearTimeout(this.autoLeaveTimeout);
    }
    this.autoLeaveTimeout = setTimeout(() => {
      const connection = getVoiceConnection(this.guild.id);
      if (connection && connection.joinConfig.channelId) {
        const channel = this.guild.channels.cache.get(
          connection.joinConfig.channelId
        );
        if (channel && channel.isVoiceBased() && channel.members.size === 1) {
          connection.destroy();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}
