import dat from "../../lib/canvas/dat";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "dat",
    name: "Dat",
    desc: "Shit is not Dat funny",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await dat(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Dat", "png")
        );
    },
} satisfies FlapsCommand;
