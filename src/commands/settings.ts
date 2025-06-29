import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "./index";
import { getSettings, saveSettings } from "../data/settings";
import { getSpeakers } from "../tts/voicevox";

export const SettingsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("読み上げの音声設定を管理します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("話者を変更します。")
        .addIntegerOption((option) =>
          option.setName("speaker").setDescription("話者ID").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("speed")
        .setDescription("読み上げ速度を変更します。")
        .addNumberOption((option) =>
          option
            .setName("value")
            .setDescription("速度 (0.5-2.0)")
            .setRequired(true)
            .setMinValue(0.5)
            .setMaxValue(2.0)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pitch")
        .setDescription("声の高さを変更します。")
        .addNumberOption((option) =>
          option
            .setName("value")
            .setDescription("高さ (-0.15-0.15)")
            .setRequired(true)
            .setMinValue(-0.15)
            .setMaxValue(0.15)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list-voices")
        .setDescription("利用可能な話者の一覧を表示します。")
    ),
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guildId) {
      await interaction.reply({
        content: "このコマンドはサーバー内でのみ使用できます。",
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "voice") {
      const speaker = interaction.options.getInteger("speaker", true);
      saveSettings(interaction.guildId, { speaker });
      await interaction.reply(`話者をID: ${speaker}に変更しました。`);
    } else if (subcommand === "speed") {
      const speed = interaction.options.getNumber("value", true);
      saveSettings(interaction.guildId, { speed });
      await interaction.reply(`読み上げ速度を${speed}に変更しました。`);
    } else if (subcommand === "pitch") {
      const pitch = interaction.options.getNumber("value", true);
      saveSettings(interaction.guildId, { pitch });
      await interaction.reply(`声の高さを${pitch}に変更しました。`);
    } else if (subcommand === "list-voices") {
      const speakers = await getSpeakers();
      const embed = new EmbedBuilder()
        .setTitle("利用可能な話者")
        .setColor(0x0099ff);

      let description = "";
      for (const speaker of speakers) {
        description += `**${speaker.name}**\n`;
        for (const style of speaker.styles) {
          description += `  - ID: ${style.id}, スタイル: ${style.name}\n`;
        }
      }

      embed.setDescription(description);

      await interaction.reply({ embeds: [embed] });
    }
  },
};
