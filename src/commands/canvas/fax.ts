import fax from "../../lib/canvas/fax";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "fax",
    name: "Fax",
    desc: "Makes someone spit their shit indeed!",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await fax(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Fax", "png")
        );
    },
} satisfies FlapsCommand;
