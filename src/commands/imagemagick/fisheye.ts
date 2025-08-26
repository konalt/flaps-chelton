import compressImage from "../../lib/ffmpeg/compressimage";
import { getVideoDimensions } from "../../lib/ffmpeg/getVideoDimensions";
import { imagemagickBuffer } from "../../lib/imagemagick/imagemagick";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "fisheye",
    name: "Fisheye",
    desc: "Adds a fisheye lens effect to an image.",
    needs: ["image"],
    async execute(args, buf) {
        let a = 0.0;
        let b = 0.4;
        let c = 0.0;
        let d = 1 - (a + b + c);
        let x = 0.5;
        let y = 0.5;
        switch (args.length) {
            case 1:
                b = parseFloat(args[0]) || 0.4;
                d = 1 - (a + b + c);
                break;
            case 2:
                x = parseFloat(args[0]) || 0.5;
                y = parseFloat(args[1]) || 0.5;
                break;
            case 3:
                b = parseFloat(args[0]) || 0.4;
                x = parseFloat(args[1]) || 0.5;
                y = parseFloat(args[2]) || 0.5;
                d = 1 - (a + b + c);
                break;
        }
        let dimensions = await getVideoDimensions(buf[0]);
        const values = [a, b, c, d, x * dimensions[0], y * dimensions[1]];
        let scaled = await compressImage(buf[0], 1000, true);
        let result = await imagemagickBuffer(
            `+distort Barrel ${values.join(",")}`,
            scaled
        );
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick_Fisheye", "png")
        );
    },
} satisfies FlapsCommand;
