import "dotenv/config";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "./commands";

const commands = [];
const commandFiles = readdirSync(join(__dirname, "commands")).filter(
  (file) => file.endsWith(".ts") && file !== "index.ts"
);

for (const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);
  const command: Command = Object.values(commandModule)[0] as Command;
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
