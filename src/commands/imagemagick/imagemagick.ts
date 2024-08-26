import { imagemagickBuffer } from "../../lib/imagemagick/imagemagick";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "imagemagick",
    name: "ImageMagick",
    desc: "Runs an ImageMagick command. Runs 'magick - {ARGS} png:'.",
    needs: ["image"],
    aliases: ["im"],
    async execute(args, buf) {
        let result = await imagemagickBuffer(args.join(" "), buf[0][0]);
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick", "png")
        );
    },
} satisfies FlapsCommand;
