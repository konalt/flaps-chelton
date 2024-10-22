import chirumiru from "../../lib/canvas/chirumiru";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "chirumiru",
    name: "Chirumiru!",
    desc: "チルミル!",
    needs: ["image", "image?"],
    async execute(args, imgbuf) {
        let out = await chirumiru(
            imgbuf.map((b) => b[0]),
            args.slice(args.length > 1 ? 1 : 0).join(" "),
            false,
            true,
            args.length > 1 ? args[0] : ""
        );
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Chirumiru", "mp4")
        );
    },
} satisfies FlapsCommand;
