import eatUp from "../../lib/canvas/eatup";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "eatup",
    name: "Eat Up",
    desc: "Places the image behind a table. Eat yo food.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await eatUp(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_EatUp", "png")
        );
    },
} satisfies FlapsCommand;
