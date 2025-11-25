import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName, parseOptions } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import snowglobe from "../../lib/ffmpeg/snowglobe";

module.exports = {
    id: "snowglobe",
    name: "Snowglobe",
    desc: "Merry Kringle",
    needs: ["image"],
    execute(args, buf) {
        return new Promise(async (res, rej) => {
            let [options] = parseOptions(args.join(" "), {
                debug: false,
                hd: false,
            });
            snowglobe(buf[0], options.hd, options.debug).then(
                handleFFmpeg(getFileName("Effect_Snowglobe", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
