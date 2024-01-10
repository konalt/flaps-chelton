import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import videogif from "../../lib/ffmpeg/videogif";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "videogif",
    name: "Video to GIF",
    desc: "Converts a video to a GIF.",
    needs: ["video"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            videogif(buf).then(
                handleFFmpeg(
                    getFileName("Effect_VideoGif", "gif"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
