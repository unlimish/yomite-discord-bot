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
- A Discord Bot Token and Client ID.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/yomite.git
    cd yomite
    ```
2.  **Configure the Bot in the Discord Developer Portal:**

    - Go to your application's page in the [Discord Developer Portal](https://discord.com/developers/applications).
    - Navigate to the "Bot" tab.
    - Under "Privileged Gateway Intents", enable the **"Message Content Intent"**. This is required for the bot to read messages.

3.  **Create a `.env` file:**
    Copy the example file:

    ```sh
    cp .env.example .env
    ```

    Then, edit the `.env` file and add your Discord bot token and client ID.

    - `DISCORD_TOKEN`: Your bot's token (from the "Bot" page).
    - `CLIENT_ID`: Your application's ID (from the "General Information" page).

4.  **Generate Bot Invitation Link:**
    In the Discord Developer Portal, go to your application, then "OAuth2" -> "URL Generator".

    - Select the scopes: `bot` and `applications.commands`.
    - Select the following "Bot Permissions":
      - `Send Messages`
      - `Embed Links`
      - `Read Message History`
      - `Connect`
      - `Speak`
    - Copy the generated URL and use it to invite the bot to your server.

5.  **Build and run the services:**

    ```sh
    docker-compose up --build -d
    ```

    This command builds the bot image and starts both the `yomite` bot and the `VOICEVOX` engine containers.

6.  **Deploy Commands:**
    Register the slash commands with Discord. In a separate terminal, run:
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
