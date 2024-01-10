# flaps-chelton
### A very, very, VERY over-engineered Discord bot built with JavaScript, then rebuilt with TypeScript.

Features:
---
* Many FFmpeg-based commands
* Many Canvas-based commands
* !stablediffusion command
* Web interface
* So, so much more.

.env instructions:
---
* To get the PLAYGROUND_COOKIE variable:
1. Go to https://playgroundai.com/ and log in with your Google account.
2. Search through the Network tab in browser DevTools to find the cookie sent along with all generation requests.
3. Copy the cookie and place it in the .env file.
* To get the OPENAI_TOKEN variable:
1. Create an OpenAI account on https://platform.openai.com/.
2. Navigate to the API keys section in the account settings.
3. Create an API key and copy it into the .env file. *It should start with `sk-`.*
* The DISCORD_TOKEN is your Discord bot token.

Notes:
---
* All instances of web uploading in this bot makes use of the main instance, hosted on https://flaps.us.to. Feel free to write a PR to change this URL, it's just not something I need to be doing right now
* The idea for !caption2 is NOT inspired by esmBot shut the fuck up

Feel free to open an issue if you need anything!
