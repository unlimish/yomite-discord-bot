import {
  CommandInteraction,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "./index";
import { saveUserSettings } from "../data/userSettings";

export const MyVoiceCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("myvoice")
    .setDescription("あなたの読み上げ音声を変更します。")
    .addIntegerOption((option) =>
      option.setName("speaker").setDescription("話者ID").setRequired(true)
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

    const speaker = interaction.options.getInteger("speaker", true);
    saveUserSettings(interaction.guildId, interaction.user.id, { speaker });
    await interaction.reply(
      `あなたの読み上げ音声をID: ${speaker}に変更しました。`
    );
  },
};
