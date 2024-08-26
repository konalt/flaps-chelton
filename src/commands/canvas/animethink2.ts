import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import animethink2 from "../../lib/canvas/animethink2";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "animethink2",
    name: "AnimeThink 2",
    desc: "makes an anime character think about the image, while someone lusts over him",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await animethink2(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_AnimeThink2", "png")
        );
    },
} satisfies FlapsCommand;
