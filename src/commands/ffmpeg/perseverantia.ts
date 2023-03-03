import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import perseverantia from "../../lib/ffmpeg/perseverantia";

module.exports = {
    id: "perseverantia",
    name: "Perseverantia",
    desc: "Don't know how to describe this command.",
    needs: ["video"],
    execute(args, buf, msg) {
        perseverantia(buf).then(
            handleFFmpeg(
                getFileName("Effect_Perseverantia", getFileExt(buf[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
