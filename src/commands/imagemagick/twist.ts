import compressImage from "../../lib/ffmpeg/compressimage";
import { getVideoDimensions } from "../../lib/ffmpeg/getVideoDimensions";
import { imagemagickBuffer } from "../../lib/imagemagick/imagemagick";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "twist",
    aliases: ["swirl"],
    name: "Twist",
    desc: "Twists an image! Wonky!",
    needs: ["image"],
    async execute(args, buf) {
        const amt = parseInt(args[0]) || 100;
        let scaled = await compressImage(buf[0], 1000, true);
        let result = await imagemagickBuffer(`-swirl ${amt}`, scaled);
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick_Twist", "png")
        );
    },
} satisfies FlapsCommand;
