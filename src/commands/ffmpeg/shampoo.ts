import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName, hexToRGB } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import shampoo from "../../lib/ffmpeg/shampoo";
import hexCode from "../../lib/canvas/hexcode";

module.exports = {
    id: "shampoo",
    name: "Shampoo",
    desc: "Creates a beautifully scented shampoo out of your character!",
    needs: ["image"],
    execute(args, buf) {
        return new Promise(async (res, rej) => {
            let rgb = { r: 0, g: 0, b: 0 };
            if (args[0] && args[0].startsWith("#")) {
                let col = hexToRGB(args[0]);
                rgb = {
                    r: col[0],
                    g: col[1],
                    b: col[2],
                };
            } else {
                rgb = await hexCode(buf[0][0]);
            }
            shampoo(buf, rgb).then(
                handleFFmpeg(getFileName("Effect_Shampoo", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
