import distort from "../../lib/imagemagick/distort";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "distort",
    name: "Distort",
    desc: "Distorts an image.",
    needs: ["image"],
    async execute(args, buf) {
        let result = await distort(
            buf[0][0],
            Math.max(0.2, Math.min(parseFloat(args[0]) || 0.5, 2))
        );
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick_Distort", "png")
        );
    },
} satisfies FlapsCommand;
