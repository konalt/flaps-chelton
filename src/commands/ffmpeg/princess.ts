import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import princess from "../../lib/ffmpeg/princess";

module.exports = {
    id: "princess",
    name: "Pretty Princess",
    desc: "Makes an image the prettiest of princesses 💞💞",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            princess(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Princess", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
