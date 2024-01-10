import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import dud from "../../lib/ffmpeg/dud";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "dud",
    name: "You Got the Dud!",
    desc: "Gives you the dud.",
    aliases: ["thehorror"],
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            dud(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Dud", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
