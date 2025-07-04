import { CommandInteraction, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from './index';
import { TTSManager } from '../tts/TTSManager';

const ttsState = new Map<string, boolean>();

export function isTTSEnabled(guildId: string): boolean {
  return ttsState.get(guildId) ?? true; // Default to true
}

export const TtsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('tts')
    .setDescription('読み上げ機能の有効/無効を切り替えます。')
    .addStringOption((option) =>
      option
        .setName('state')
        .setDescription('有効または無効')
        .setRequired(true)
        .addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' }),
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
      await interaction.editReply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
      });
      return;
    }
    const state = interaction.options.getString('state', true) as 'on' | 'off';

    if (state === 'on') {
      ttsState.set(interaction.guildId, true);
      await interaction.editReply('読み上げを有効にしました。');
    } else {
      ttsState.set(interaction.guildId, false);
      const ttsManager = TTSManager.getInstance(interaction.guild!);
      ttsManager.stop();
      await interaction.editReply('読み上げを無効にしました。');
    }
  },
};
