import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from './index';
import { getVoiceConnection } from '@discordjs/voice';
import { TTSManager } from '../tts/TTSManager';
import { isTTSEnabled } from './tts';

export const StatusCommand: Command = {
  data: new SlashCommandBuilder().setName('status').setDescription('Botの現在の状態を表示します。'),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild) {
      await interaction.editReply({ content: 'このコマンドはサーバー内でのみ使用できます。' });
      return;
    }

    const connection = getVoiceConnection(interaction.guild.id);
    const ttsManager = TTSManager.getInstance(interaction.guild);
    const queueSize = (ttsManager as any).queue.length; // Accessing private property for status

    const embed = new EmbedBuilder()
      .setTitle('Yomiage Bot Status')
      .setColor(0x0099ff)
      .addFields(
        {
          name: '接続チャンネル',
          value: connection ? `<#${connection.joinConfig.channelId}>` : '未接続',
        },
        { name: '読み上げ状態', value: isTTSEnabled(interaction.guild.id) ? '有効' : '無効' },
        { name: 'キューの件数', value: `${queueSize}件` },
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
