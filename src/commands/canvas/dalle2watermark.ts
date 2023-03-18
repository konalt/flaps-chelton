import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../../lib/canvas/animethink";
import dalle2watermark from "../../lib/canvas/dalle2watermark";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "dalle2watermark",
    name: "DALL-E 2 Watermark",
    desc: "Applies the DALL-E 2 watermark to an image.",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            dalle2watermark(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_DallE2Watermark", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
