import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import whatever from "../../lib/ffmpeg/whatever";
import caption2 from "../../lib/ffmpeg/caption2";
import videoGif from "../../lib/ffmpeg/videogif";

module.exports = {
    id: "whatever",
    name: "Whatever",
    desc: "whatever. go my flaps command",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise(async (res, rej) => {
            let w = await whatever(buf);
            let captioned = await caption2([[w, "mp4"]], {
                text: "whatever. go my " + args.join(" "),
            });
            let gif = videoGif([[captioned, "mp4"]]);
            gif.then(
                handleFFmpeg(getFileName("Effect_Whatever", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
