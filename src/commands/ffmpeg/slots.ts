import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import slots from "../../lib/ffmpeg/slots";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "slots",
    name: "Slots",
    desc: "Rolls the slot machine for you!",
    aliases: ["slot", "slotmachine"],
    needs: ["image", "image?", "image?", "image?"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            slots(buf).then(
                handleFFmpeg(getFileName("Effect_Slots", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
