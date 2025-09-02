import pyramid from "../../lib/canvas/pyramid";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "pyramid",
    name: "Pyramid",
    desc: "It's a basic need.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await pyramid(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Pyramid", "png")
        );
    },
} satisfies FlapsCommand;
