import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";
import { Command } from "./index";

export const JoinCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Botをボイスチャンネルに参加させます。"),
  async execute(interaction: CommandInteraction) {
    if (!(interaction.member instanceof GuildMember)) {
      await interaction.reply({
        content: "このコマンドはサーバー内でのみ使用できます。",
        ephemeral: true,
      });
      return;
    }

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "まずボイスチャンネルに参加してください。",
        ephemeral: true,
      });
      return;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      await interaction.reply(
        `✅ ${voiceChannel.name}に接続しました。このチャンネルのテキストを読み上げます。`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "ボイスチャンネルへの接続に失敗しました。",
        ephemeral: true,
      });
    }
  },
};
