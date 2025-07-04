import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { Command } from './index';

export const LeaveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Botをボイスチャンネルから切断させます。'),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guildId) {
      await interaction.editReply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
      });
      return;
    }
    const connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
      await interaction.editReply({
        content: 'Botはボイスチャンネルに接続していません。',
      });
      return;
    }

    connection.destroy();
    await interaction.editReply('ボイスチャンネルから切断しました。');
  },
};
