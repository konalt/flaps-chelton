import animethink from "../../lib/canvas/animethink";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "animethink",
    name: "AnimeThink",
    desc: "makes some anime characters think about a given image for a while",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await animethink(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_AnimeThink", "png")
        );
    },
} satisfies FlapsCommand;
