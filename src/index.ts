import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "./commands";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();
const commandFiles = readdirSync(join(__dirname, "commands")).filter(
  (file) => file.endsWith(".ts") && file !== "index.ts"
);

for (const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);
  const command: Command = Object.values(commandModule)[0] as Command;
  if (command.data) {
    commands.set(command.data.name, command);
  }
}

client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "コマンドの実行中にエラーが発生しました。",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
