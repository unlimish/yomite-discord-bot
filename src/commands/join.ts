import { CommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { Command } from './index';
import { TTSManager } from '../tts/TTSManager';

export const JoinCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Botをボイスチャンネルに参加させます。'),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true }); // Acknowledge the interaction immediately
    if (!(interaction.member instanceof GuildMember)) {
      await interaction.editReply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
      });
      return;
    }

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply({
        content: 'まずボイスチャンネルに参加してください。',
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
      const ttsManager = TTSManager.getInstance(voiceChannel.guild);
      ttsManager.setTextChannel(interaction.channelId!);
      await interaction.editReply(
        `✅ ${voiceChannel.name}に接続しました。このチャンネルのテキストを読み上げます。`,
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'ボイスチャンネルへの接続に失敗しました。',
      });
    }
  },
};
