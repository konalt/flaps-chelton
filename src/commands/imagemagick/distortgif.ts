import distortGIF from "../../lib/imagemagick/distortgif";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "distortgif",
    name: "Distort GIF",
    desc: "Distorts an image but FUNNIER",
    needs: ["image"],
    execute: async (args, buf) => {
        let result = await distortGIF(buf[0][0]);
        return makeMessageResp(
            "ffmpeg",
            "",
            null,
            result,
            getFileName("ImageMagick_DistortGIF", "gif")
        );
    },
} satisfies FlapsCommand;
