import overhere from "../../lib/canvas/overhere";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "overhere",
    name: "Over Here",
    desc: "I'm over here :D my :D",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await overhere(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_OverHere", "png")
        );
    },
} satisfies FlapsCommand;
