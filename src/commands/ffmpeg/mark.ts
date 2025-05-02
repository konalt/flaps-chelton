import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import mark from "../../lib/ffmpeg/mark";

module.exports = {
    id: "mark",
    name: "Mark",
    desc: "Makes the Naked Outsider apply his Mark",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            mark(buf).then(
                handleFFmpeg(getFileName("Effect_Mark", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
