import {
    getFileExt,
    getFileName,
    hexToRGB,
    makeMessageResp,
    rgbToHue,
} from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import hueshift from "../../lib/ffmpeg/hueshift";

const Colors = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    aqua: 180,
    blue: 240,
    purple: 270,
    pink: 300,
    magenta: 330,
};

module.exports = {
    id: "hueshift",
    name: "Hue Shift",
    desc: "Shifts the hue of an image or video.",
    needs: ["image/video"],
    aliases: ["hue", "shift"],
    async execute(args, buffers) {
        let shift = 0;
        if (Object.keys(Colors).includes(args[0])) {
            if (Object.keys(Colors).includes(args[1])) {
                shift = Colors[args[1]] - Colors[args[0]];
            } else {
                shift = Colors[args[0]];
            }
        } else if (args[0].startsWith("#")) {
            if (args[1] && args[1].startsWith("#")) {
                shift =
                    rgbToHue(...hexToRGB(args[1])) -
                    rgbToHue(...hexToRGB(args[0]));
            } else {
                shift = rgbToHue(...hexToRGB(args[0]));
            }
        } else if (parseInt(args[0])) {
            if (parseInt(args[1])) {
                shift = parseInt(args[1]) - parseInt(args[0]);
            } else {
                shift = parseInt(args[0]);
            }
        } else {
            return makeMessageResp("ffmpeg", "that's not a valid thingy!");
        }
        return new Promise((res, rej) => {
            hueshift(buffers[0], shift).then(
                handleFFmpeg(
                    getFileName("Effect_HueShift", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
