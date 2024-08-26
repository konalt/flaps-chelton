import albumcover from "../../lib/canvas/albumcover";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "albumcover",
    name: "Album Cover",
    desc: "Applies the Parental Advisory watermark to an image.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await albumcover(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_AlbumCover", "png")
        );
    },
} satisfies FlapsCommand;
