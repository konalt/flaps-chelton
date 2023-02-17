import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../lib/canvas/animethink";
import { getFileName } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "animethink",
    name: "AnimeThink",
    desc: "makes some anime characters think about a given image for a while",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        if (!imgbuf) return;
        animethink(imgbuf[0][0]).then((out: Buffer) => {
            sendWebhook(
                "flaps",
                "",
                msg.channel as TextChannel,
                out,
                getFileName("Canvas_AnimeThink", "png")
            );
        });
    },
} satisfies FlapsCommand;
