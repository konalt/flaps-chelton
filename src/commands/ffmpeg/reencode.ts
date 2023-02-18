import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import reencode from "../../lib/ffmpeg/reencode";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "reencode",
    name: "Re-Encode",
    desc: "Re-encodes a video into H264. Useful if you have a video in H265.",
    needs: ["video"],
    execute(args, buf, msg) {
        reencode(buf).then(
            handleFFmpeg(
                getFileName("Effect_ReEncode", getFileExt(buf[0][1])),
                msg.channel as TextChannel
            )
        );
    },
} satisfies FlapsCommand;
