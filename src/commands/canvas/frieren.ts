import frieren from "../../lib/canvas/frieren";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "frieren",
    name: "Frieren",
    desc: "Makes Frieren hold an object.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await frieren(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Frieren", "png")
        );
    },
} satisfies FlapsCommand;
