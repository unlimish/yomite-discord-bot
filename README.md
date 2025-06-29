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
2.  Create a `.env` file from the `.env.example` file and fill in your Discord bot token and client ID.
3.  Build and run the bot with Docker Compose:
    ```sh
    docker-compose up --build
    ```
4.  In a separate terminal, register the slash commands:
    ```sh
    npm run deploy
    ```

## License

This project is licensed under the MIT License.
