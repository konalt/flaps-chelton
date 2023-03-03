import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import trim from "../../lib/ffmpeg/trim";

module.exports = {
    id: "trim",
    name: "Trim",
    desc: "Trims a video or audio clip.",
    needs: ["video/audio"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        trim(buffers, {
            start: parseFloat(args[0]),
            end: parseFloat(args[1]),
        }).then(
            handleFFmpeg(
                getFileName("Effect_Trim", getFileExt(buffers[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
