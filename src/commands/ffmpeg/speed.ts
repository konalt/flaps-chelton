import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import speed from "../../lib/ffmpeg/speed";

module.exports = {
    id: "speed",
    name: "Speed",
    desc: "Changes the speed of a video or audio clip.",
    needs: ["video/audio"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        speed(buffers, {
            speed: parseFloat(args[0]),
        }).then(
            handleFFmpeg(
                getFileName("Effect_Speed", getFileExt(buffers[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
