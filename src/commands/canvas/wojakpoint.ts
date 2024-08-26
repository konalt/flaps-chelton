import wojakpoint from "../../lib/canvas/wojakpoint";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "wojakpoint",
    name: "Wojak Point",
    desc: "Makes two Wojaks point at something interesting.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await wojakpoint(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_WojakPoint", "png")
        );
    },
} satisfies FlapsCommand;
