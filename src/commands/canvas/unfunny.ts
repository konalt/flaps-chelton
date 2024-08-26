import unfunny from "../../lib/canvas/unfunny";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "unfunny",
    name: "Unfunny",
    desc: "Replaces all the unfunny in an image with funny.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await unfunny(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Unfunny", "png")
        );
    },
} satisfies FlapsCommand;
