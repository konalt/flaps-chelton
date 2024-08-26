import loregift from "../../lib/canvas/loregift";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "loregift",
    name: "Lore Gift",
    desc: "Makes Loremaster gift you an object.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await loregift(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_LoreGift", "png")
        );
    },
} satisfies FlapsCommand;
