import { TextChannel } from "discord.js";
import handleFFmpeg from "../lib/ffmpeg/handleFFmpeg";
import invert from "../lib/ffmpeg/invert";
import { getFileExt, getFileName } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "invert",
    name: "Invert",
    desc: "Inverts the colours of an image or video.",
    needs: ["image/video/gif"],
    execute(args, buf, msg) {
        invert(buf).then(
            handleFFmpeg(
                getFileName("Effect_Invert", getFileExt(buf[0][1])),
                msg.channel as TextChannel
            )
        );
    },
} satisfies FlapsCommand;
