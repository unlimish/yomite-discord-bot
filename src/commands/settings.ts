import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import { Command } from './index';
import { getSettings, saveSettings } from '../data/settings';
import { getUserSettings, saveUserSettings } from '../data/userSettings';
import { getSpeakers } from '../tts/voicevox';

export const SettingsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('読み上げの音声設定を管理します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName('list-voices').setDescription('利用可能な話者の一覧を表示します。'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('url-handling')
        .setDescription('URLの読み上げ方法を設定します。')
        .addStringOption((option) =>
          option
            .setName('mode')
            .setDescription('モードを選択')
            .setRequired(true)
            .addChoices(
              { name: '読み上げる', value: 'read' },
              { name: 'スキップ', value: 'skip' },
              { name: 'ドメインのみ', value: 'domain' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ignore-prefix')
        .setDescription('読み上げを無視するプレフィックスを設定します。')
        .addStringOption((option) =>
          option.setName('prefix').setDescription('プレフィックス').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('sampling-rate')
        .setDescription('出力サンプリングレートを変更します。')
        .addIntegerOption((option) =>
          option.setName('value').setDescription('サンプリングレート').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('read-emojis')
        .setDescription('標準の絵文字を読み上げるかどうかを設定します。')
        .addBooleanOption((option) =>
          option.setName('value').setDescription('有効または無効').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('myvoice')
        .setDescription('あなたの読み上げ音声を変更します。')
        .addIntegerOption((option) =>
          option.setName('speaker').setDescription('話者ID').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('myspeed')
        .setDescription('あなたの読み上げ速度を変更します。')
        .addNumberOption((option) =>
          option
            .setName('value')
            .setDescription('速度 (0.5-2.0)')
            .setRequired(true)
            .setMinValue(0.5)
            .setMaxValue(2.0),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mypitch')
        .setDescription('あなたの声の高さを変更します。')
        .addNumberOption((option) =>
          option
            .setName('value')
            .setDescription('高さ (-0.15-0.15)')
            .setRequired(true)
            .setMinValue(-0.15)
            .setMaxValue(0.15),
        ),
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
      await interaction.editReply({ content: 'このコマンドはサーバー内でのみ使用できます。' });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'url-handling') {
      const mode = interaction.options.getString('mode', true) as 'read' | 'skip' | 'domain';
      saveSettings(interaction.guildId, { urlHandling: mode });
      await interaction.editReply(`URLの読み上げ方法を「${mode}」に設定しました。`);
    } else if (subcommand === 'ignore-prefix') {
      const prefix = interaction.options.getString('prefix', true);
      const settings = getSettings(interaction.guildId);
      if (settings.ignoredPrefixes.includes(prefix)) {
        settings.ignoredPrefixes = settings.ignoredPrefixes.filter((p) => p !== prefix);
        await interaction.editReply(`プレフィックス「${prefix}」を無視リストから削除しました。`);
      } else {
        settings.ignoredPrefixes.push(prefix);
        await interaction.editReply(`プレフィックス「${prefix}」を無視リストに追加しました。`);
      }
      saveSettings(interaction.guildId, { ignoredPrefixes: settings.ignoredPrefixes });
    } else if (subcommand === 'sampling-rate') {
      const value = interaction.options.getInteger('value', true);
      saveSettings(interaction.guildId, { outputSamplingRate: value });
      await interaction.editReply(`出力サンプリングレートを${value}に変更しました。`);
    } else if (subcommand === 'read-emojis') {
      const value = interaction.options.getBoolean('value', true);
      saveSettings(interaction.guildId, { readStandardEmojis: value });
      await interaction.editReply(`標準の絵文字の読み上げを${value ? '有効' : '無効'}にしました。`);
    } else if (subcommand === 'myvoice') {
      const speaker = interaction.options.getInteger('speaker', true);
      saveUserSettings(interaction.guildId, interaction.user.id, { speaker });
      await interaction.editReply({
        content: `あなたの読み上げ音声をID: ${speaker}に変更しました。`,
      });
    } else if (subcommand === 'myspeed') {
      const speed = interaction.options.getNumber('value', true);
      saveUserSettings(interaction.guildId, interaction.user.id, { speed });
      await interaction.editReply({ content: `あなたの読み上げ速度を${speed}に変更しました。` });
    } else if (subcommand === 'mypitch') {
      const pitch = interaction.options.getNumber('value', true);
      saveUserSettings(interaction.guildId, interaction.user.id, { pitch });
      await interaction.editReply({ content: `あなたの声の高さを${pitch}に変更しました。` });
    } else if (subcommand === 'list-voices') {
      const speakers = await getSpeakers();
      const embed = new EmbedBuilder().setTitle('利用可能な話者').setColor(0x0099ff);

      let description = '';
      for (const speaker of speakers) {
        description += `**${speaker.name}**\n`;
        for (const style of speaker.styles) {
          description += `  - ID: ${style.id}, スタイル: ${style.name}\n`;
        }
      }

      description += `\n[サンプルボイスリスト](https://voicevox.hiroshiba.jp/#characters)\n`;
      embed.setDescription(description);

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
