import raptv from "../../lib/canvas/raptv";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "raptv",
    name: "Rap TV",
    desc: "Creates a Rap TV news image.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await raptv(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_RapTV", "png")
        );
    },
} satisfies FlapsCommand;
