import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink from "../../lib/canvas/animethink";
import albumcover from "../../lib/canvas/albumcover";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "albumcover",
    name: "Album Cover",
    desc: "Applies the Parental Advisory watermark to an image.",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            albumcover(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_AlbumCover", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
