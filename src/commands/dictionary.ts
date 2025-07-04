import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import { Command } from './index';
import { getDictionary, addWord, removeWord } from '../data/dictionary';

export const DictionaryCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('dictionary')
    .setDescription('単語辞書を管理します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('単語を辞書に登録します。')
        .addStringOption((option) =>
          option.setName('word').setDescription('登録する単語').setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('reading').setDescription('単語の読み方').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('単語を辞書から削除します。')
        .addStringOption((option) =>
          option.setName('word').setDescription('削除する単語').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('登録されている単語の一覧を表示します。'),
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
      await interaction.editReply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      const word = interaction.options.getString('word', true);
      const reading = interaction.options.getString('reading', true);
      addWord(interaction.guildId, word, reading);
      await interaction.editReply(`「${word}」を「${reading}」として辞書に登録しました。`);
    } else if (subcommand === 'remove') {
      const word = interaction.options.getString('word', true);
      removeWord(interaction.guildId, word);
      await interaction.editReply(`「${word}」を辞書から削除しました。`);
    } else if (subcommand === 'list') {
      const dictionary = getDictionary(interaction.guildId);
      const embed = new EmbedBuilder().setTitle('単語辞書').setColor(0x0099ff);

      const description = Object.entries(dictionary)
        .map(([word, reading]) => `**${word}**: ${reading}`)
        .join('\n');

      embed.setDescription(description || '辞書に単語は登録されていません。');

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
