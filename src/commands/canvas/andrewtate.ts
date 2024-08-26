import andrewtate from "../../lib/canvas/andrewtate";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "andrewtate",
    name: "Andrew Tate",
    desc: "ANDREW TATE has been BANNED from FLAPS CHELTON",
    needs: ["image"],
    aliases: ["tate"],
    async execute(args, imgbuf) {
        let out = await andrewtate(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_AndrewTate", "png")
        );
    },
} satisfies FlapsCommand;
