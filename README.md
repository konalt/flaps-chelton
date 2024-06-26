# flaps-chelton

### A very, very, VERY over-engineered Discord bot built with JavaScript, then rebuilt with TypeScript.

## Features:

-   Many FFmpeg-based commands
-   Many Canvas-based commands
-   !stablediffusion command
-   Web interface
-   So, so much more.

## .env instructions:

-   `DISCORD_TOKEN` is your Discord bot token.
-   `OPENAI_TOKEN` is an OpenAI API key.
-   `OPENAI_ENABLED` is whether or not to enable OpenAI features. Can be either `yes` or `no`.
-   `WEB3D_HEADLESS` is whether or not to run 3D commands without a window. Can be either `yes` or `no`.
-   `FFMPEG_VERBOSE` is whether or not to log FFmpeg command output. Can be either `yes` or `no`.
-   `WEB_PORT` is the port to run the webserver on.
-   `OWNER_TOKEN` is the bot owner's Discord User ID.
-   `MAIN_CHANNEL` is the Discord Channel ID for the channel to send occasional messages.
-   `MAIN_GUILD` is the Discord Guild ID for the guild containing the main channel.
-   `MIDNIGHT_START_MESSAGE` is the message to send at midnight.
-   `MIDNIGHT_GOOD_MESSAGE` is the message to send at 1 minute past midnight when all users have responded.
-   `MIDNIGHT_BAD_MESSAGE` is the message to send at 1 minute past midnight when some users have not responded.
-   `COUNTDOWN_END_DATE` is an ISO-8601 date string for when !countdown should count down to.
-   `PLAYGROUND_COOKIE` is your Cookie header from Playground AI generation requests.
-   `COMMAND_PREFIX` is the prefix sent before commands.
-   `WEBHOOK_PREFIX` is the prefix sent before webhook messages.
-   `MAX_PERMA_IMAGE_SIZE` is the maximum size (X and Y) of an image uploaded through !imgurl.
-   `VERBOSE` is a general verbosity option. Can be either `yes` or `no`.
-   `DOMAIN` is the public-facing domain/IP of your instance.
-   `ENABLE_TRACK` is whether or not to log all messages to a track file. Can be either `yes` or `no`.
-   `TRACK_KEYWORDS` is a comma-separated list of keywords to mark messages containing for the track file. See default value for more details.
-   `TRACK_SERVER_REPORTS` is a comma-separated list of GuildID:ChannelIDs to send the day's track file to at midnight.

Feel free to open an issue if you need anything!
