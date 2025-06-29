import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { Command } from "./index";

export const LeaveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Botをボイスチャンネルから切断させます。"),
  async execute(interaction: CommandInteraction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: "このコマンドはサーバー内でのみ使用できます。",
        ephemeral: true,
      });
      return;
    }
    const connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
      await interaction.reply({
        content: "Botはボイスチャンネルに接続していません。",
        ephemeral: true,
      });
      return;
    }

    connection.destroy();
    await interaction.reply("ボイスチャンネルから切断しました。");
  },
};
