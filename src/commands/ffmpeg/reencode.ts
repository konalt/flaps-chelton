import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import reencode from "../../lib/ffmpeg/reencode";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "reencode",
    name: "Re-Encode",
    desc: "Re-encodes a video into H264. Useful if you have a video in H265.",
    needs: ["video"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            reencode(buf).then(
                handleFFmpeg(
                    getFileName("Effect_ReEncode", getFileExt(buf[0][1])),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
