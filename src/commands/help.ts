import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { Command } from "./index";
import { readdirSync } from "fs";
import { join } from "path";

export const HelpCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("利用可能なすべてのコマンドを表示します。"),
  async execute(interaction: CommandInteraction) {
    const commandFiles = readdirSync(__dirname).filter(
      (file) =>
        file.endsWith(".ts") && file !== "index.ts" && file !== "help.ts"
    );
    const embed = new EmbedBuilder()
      .setTitle("Yomiage Bot Help")
      .setColor(0x0099ff)
      .setDescription("利用可能なコマンドの一覧です。");

    for (const file of commandFiles) {
      const commandModule = require(`./${file}`);
      const command: Command = Object.values(commandModule)[0] as Command;
      if (command.data) {
        embed.addFields({
          name: `/${command.data.name}`,
          value: command.data.description,
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
