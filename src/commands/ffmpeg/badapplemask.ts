import badapplemask from "../../lib/ffmpeg/badapplemask";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "badapplemask",
    name: "Bad Apple Mask",
    desc: "Combines 2 videos with Bad Apple as a mask.",
    needs: ["video", "video"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            badapplemask(buf).then(
                handleFFmpeg(
                    getFileName("Effect_BadAppleMask", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
