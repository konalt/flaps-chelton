import jhold from "../../lib/canvas/jhold";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "jhold",
    name: "J Hold",
    desc: "Makes J hold an object.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await jhold(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_JHold", "png")
        );
    },
} satisfies FlapsCommand;
