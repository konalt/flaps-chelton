import distort from "../../lib/imagemagick/distort";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "distort2",
    name: "Distort 2",
    desc: "Distorts an image the other way. Easier than doing !distort 1.5 ==> !distort 1.5",
    needs: ["image"],
    async execute(args, buf) {
        let result = await distort(await distort(buf[0][0], 1.5), 1.5);
        return makeMessageResp(
            "ffmpeg",
            "",
            result,
            getFileName("ImageMagick_Distort2", "png")
        );
    },
} satisfies FlapsCommand;
