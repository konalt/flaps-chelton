import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../../lib/canvas/animethink";
import hexcode from "../../lib/canvas/hexcode";
import { getFileName, rgbtohex } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand, RGBColor } from "../../types";

module.exports = {
    id: "hexcode",
    name: "Hex Code",
    desc: "Gets the average hex colour of an image.",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        if (!imgbuf) return;
        hexcode(imgbuf[0][0]).then((out: RGBColor) => {
            sendWebhook(
                "flaps",
                "your hexcode is: damn " + rgbtohex(out),
                msg.channel as TextChannel
            );
        });
    },
} satisfies FlapsCommand;
