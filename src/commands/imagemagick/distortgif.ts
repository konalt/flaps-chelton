import distortGIF from "../../lib/imagemagick/distortgif";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "distortgif",
    name: "Distort GIF",
    desc: "Distorts an image but FUNNIER",
    needs: ["image"],
    async execute(args, buf) {
        let result = await distortGIF(buf[0][0]);
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick_DistortGIF", "gif")
        );
    },
} satisfies FlapsCommand;
