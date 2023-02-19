import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../../lib/canvas/animethink";
import fakescreenshot from "../../lib/canvas/fakescreenshot";
import hexcode from "../../lib/canvas/hexcode";
import { getFileName, rgbtohex } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand, RGBColor } from "../../types";

module.exports = {
    id: "fakescreenshot",
    name: "Fake Screenshot",
    desc: "Generates a slanderous reddit screenshot.",
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        fakescreenshot(args[0]).then((out: Buffer) => {
            sendWebhook(
                "flaps",
                "",
                msg.channel,
                out,
                getFileName("Canvas_FakeScreenshot", "png")
            );
        });
    },
} satisfies FlapsCommand;
