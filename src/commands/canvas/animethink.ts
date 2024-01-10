import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../../lib/canvas/animethink";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "animethink",
    name: "AnimeThink",
    desc: "makes some anime characters think about a given image for a while",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            animethink(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_AnimeThink", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
