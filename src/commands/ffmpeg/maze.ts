import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import maze from "../../lib/ffmpeg/maze";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "maze",
    name: "Maze",
    desc: "Enter your Maze",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            maze(buf).then(
                handleFFmpeg(getFileName("Effect_Maze", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
