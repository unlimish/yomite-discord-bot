# yomite

yomite is a high-featured, customizable text-to-speech (TTS) bot for Discord, designed to enhance the voice chat experience.

## Features

- **Real-time Text-to-Speech**: Reads messages from a designated text channel in real-time.
- **Queueing System**: Manages multiple messages in a queue to prevent overlap.
- **Voice Channel Management**: Join and leave voice channels with commands.
- **Auto-Disconnect**: Automatically leaves the voice channel when it's empty.
- **Customizable Dictionary**: Define custom pronunciations for specific words.
- **Voice Customization**: Change the speaker, speed, and pitch of the TTS voice.
- **Content Filtering**: Filter out URLs and messages with custom prefixes.
- **Slash Commands**: All commands are implemented as slash commands.
- **Docker Support**: Easy to deploy with Docker and Docker Compose.

## Commands

- `/join`: Joins the voice channel you are in.
- `/leave`: Leaves the voice channel.
- `/tts <on|off>`: Enables or disables text-to-speech.
- `/status`: Shows the bot's current status.
- `/help`: Shows a list of all available commands.
- `/dictionary <add|remove|list>`: Manages the word dictionary.
- `/settings <voice|speed|pitch|url-handling|ignore-prefix|list-voices>`: Manages the voice settings.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A Discord Bot Token and Client ID. You can get these from the [Discord Developer Portal](https://discord.com/developers/applications).

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/yomite.git
    cd yomite
    ```
2.  Create a `.env` file. You can copy the `.env.example` if it exists, or create it from scratch. Fill in your `DISCORD_TOKEN` and `CLIENT_ID`.
    ```
    DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
    CLIENT_ID=YOUR_CLIENT_ID
    VOICEVOX_API_URL=http://voicevox:50021
    ```
3.  Build and run the services with Docker Compose:

    ```sh
    docker-compose up --build -d
    ```

    This command builds the bot image and starts both the `yomite` bot and the `VOICEVOX` engine containers.

4.  Register the slash commands with Discord. In a separate terminal, run:

    ```sh
    npm run deploy
    ```

    _Note: You only need to run this once, or whenever you add or modify commands._

## How It Works

The `docker-compose.yml` file orchestrates the services needed to run the bot:

- **`bot` service**: Builds the Docker image for the yomite bot from the `Dockerfile` and runs it.
- **`voicevox` service**: Pulls the official `voicevox/voicevox_engine` image and runs it. This provides the TTS engine that the bot communicates with.

This setup means you don't need to install or run the VOICEVOX engine manually. Docker Compose handles everything.

## License

This project is licensed under the MIT License.
