import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './commands';
import { getVoiceConnection } from '@discordjs/voice';
import { TTSManager } from './tts/TTSManager';
import { isTTSEnabled } from './commands/tts';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const commands = new Collection<string, Command>();
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(
  (file) =>
    (file.endsWith('.ts') || file.endsWith('.js')) && file !== 'index.ts' && file !== 'index.js',
);

for (const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);
  const command: Command = Object.values(commandModule)[0] as Command;
  if (command.data) {
    commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user?.tag}`);
  client.user?.setActivity('土佐日記', { type: ActivityType.Playing });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  console.log(`Received command: ${interaction.commandName}`);
  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'コマンドの実行中にエラーが発生しました。',
      ephemeral: true,
    });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const connection = getVoiceConnection(message.guild.id);
  if (!connection) return;

  const ttsManager = TTSManager.getInstance(message.guild);
  const boundTextChannelId = ttsManager.getTextChannelId();

  // Only read messages from the bound text channel
  if (!boundTextChannelId || message.channel.id !== boundTextChannelId) {
    return;
  }

  // Check if the user is in the same voice channel as the bot
  if (message.member?.voice.channelId !== connection.joinConfig.channelId) {
    return;
  }

  if (!isTTSEnabled(message.guild.id)) return;

  ttsManager.addToQueue(message.content, message.author.id);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelId === newState.channelId) return; // No change in channel
  if (oldState.member?.user.bot) return;

  const ttsManager = TTSManager.getInstance(oldState.guild);
  if (ttsManager) {
    ttsManager.resetAutoLeaveTimeout();
  }
});

client.login(process.env.DISCORD_TOKEN);
