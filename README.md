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
-   `DEPTHMAP_SERVER_PORT` is the port for a server that turns images into depth maps, at the path /depth. Works best with MiDaS.
-   `FLAPS_FFMPEG_SERVER_HEALTH_HOST` is the HTTP address for an instance of konalt/flaps-ffmpeg-server.
-   `FLAPS_FFMPEG_SERVER_HEALTH_HOST` is the WebSocket address for an instance of konalt/flaps-ffmpeg-server.
-   `DUO_NOTIF_CHANNEL` is the Discord Channel ID for the channel to send a message at 23:30 every day to remind the bot owner to do the FUCKING duolingo lesson
-   `AVIF_CONVERT_EMOJI_ID` is the Discord Emoji ID for the emoji to react with to a message with an AVIF to convert the image to a PNG.
-   `NYQUIST_PATH` is the path to the Nyquist executable
-   `FRIDAY_CHANNEL` is the Discord Channel ID for the channel to send a message at 17:00 every Friday to celebrate the end of the week.
-   `EVAL_OVERRIDE`, when set to `yes`, will show !eval on the command simulator. **WARNING: THIS ALSO DISABLES ALL EVAL PROTECTIONS, INCLUDING THE DISCORD USER ID CHECK. USE SPARINGLY!**
-   `FLAPS_PLUS` is whether or not to enable the Flaps GOLD+ April Fool's joke.

## brainrot.txt info:

`brainrot.txt` is the file with all the data needed for `!brainrot`.

### Sections:

-   `#TEMPLATE` - List of default templates.
-   `#TEMPLATE_SENSUAL` - List of default templates, specifically sensual ones. Can be forced with `!brainrot sensual`.
-   `#CHARACTER` - List of characters to include. All character names should be preceded with a gender (for example, `m@flaps`). Possible genders are `m` (male), `f` (female), and `t` (they). `r` can also be used to pick one at random.
-   `#NOUN` - List of nouns. Plurals are placed after a `/` (for example, `apple/apples`).
-   `#ADJECTIVE` - List of adjectives. Adverbs are placed after a `/` (for example, `fast/quickly`).
-   `#LOCATION` - List of locations.
-   `#VERB` - List of verbs. Present participles are placed after a `/` (for example, `run/running`).

### Replacements:

In all templates, and optionally in command arguments, replacement keys are used. These are codes between percent signs to tell the command what to replace the key with.

#### Examples:

-   `%n%` - Replaces with a random singular noun.
-   `%na%` - Replaces with a random singular noun or adjective.
-   `%n~0%` - Replaces with the first randomly chosen singular noun in the sentence.
-   `%g~0+2%` - Replaces with the possessive pronoun corresponding to the gender of the first randomly chosen character in the sentence.
-   `%n!%` - Replaces with a random plural noun.
-   `%n?%` - Replaces with a random singular or plural noun.
-   `%ncalv%` - Replaces with a random singular noun, character, adjective, location or verb.
-   `%a!%` - Replaces with an adverb.

_Replacement keys can also be put in capital letters to force the replacement into capitals. Example: `%N~0%`_

Feel free to open an issue if you need anything!
