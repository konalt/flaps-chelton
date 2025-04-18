import political from "../../lib/canvas/political";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "political",
    name: "Political",
    desc: "Is it political? I don't get it!",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await political(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Political", "png")
        );
    },
} satisfies FlapsCommand;
