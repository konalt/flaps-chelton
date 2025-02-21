import homodog from "../../lib/canvas/homodog";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "homodog",
    name: "Homophobic Dog",
    desc: "Not too fond...",
    needs: ["image?"],
    async execute(args, imgbuf) {
        let out: Buffer;
        if (imgbuf[0]) {
            out = await homodog(imgbuf[0][0], args.join(" "));
        } else {
            out = await homodog(null, args.join(" "));
        }
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Homodog", "png")
        );
    },
} satisfies FlapsCommand;
