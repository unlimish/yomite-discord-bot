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
import { postAudioQuery, postSynthesis } from "./voicevox";
import { getDictionary } from "../data/dictionary";
import { getSettings } from "../data/settings";
import { getUserSettings } from "../data/userSettings";

const emoji = require("node-emoji");

interface TTSQueueItem {
  text: string;
  userId: string;
}

export class TTSManager {
  private static instances = new Map<string, TTSManager>();
  private player: AudioPlayer;
  private queue: TTSQueueItem[] = [];
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

  public addToQueue(text: string, userId: string) {
    this.queue.push({ text, userId });
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
    const queueItem = this.queue.shift()!;
    let text = queueItem.text;
    const userId = queueItem.userId;

    const serverSettings = getSettings(this.guild.id);
    const userSettings = getUserSettings(this.guild.id, userId);

    const speaker = userSettings.speaker ?? serverSettings.speaker;

    // Ignored prefixes
    for (const prefix of serverSettings.ignoredPrefixes) {
      if (text.startsWith(prefix)) {
        this.isPlaying = false;
        this.playNext();
        return;
      }
    }

    // URL handling
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      switch (serverSettings.urlHandling) {
        case "skip":
          this.isPlaying = false;
          this.playNext();
          return;
        case "domain":
          text = text.replace(urlRegex, (url: string) => new URL(url).hostname);
          break;
        case "read":
          text = text.replace(urlRegex, "URL");
          break;
      }
    }

    // Strip custom emojis
    const customEmojiRegex = /<a?:.+?:\d+>/g;
    text = text.replace(customEmojiRegex, "");

    // Handle standard emoji shortcodes
    if (serverSettings.readStandardEmojis) {
      text = text.replace(/:([\w_]+):/g, (match, p1) => p1.replace(/_/g, " "));
    }

    const dictionary = getDictionary(this.guild.id);
    for (const word in dictionary) {
      text = text.replace(new RegExp(word, "g"), dictionary[word]);
    }

    try {
      const audioQuery = await postAudioQuery(text, speaker, this.guild.id);
      audioQuery.speed = serverSettings.speed;
      audioQuery.pitch = serverSettings.pitch;
      const audio = await postSynthesis(audioQuery, speaker);
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
