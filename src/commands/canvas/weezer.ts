import weezer from "../../lib/canvas/weezer";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "weezer",
    name: "Weezer",
    desc: "Creates a Weezer album cover",
    async execute() {
        let out = await weezer();
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Weezer", "png")
        );
    },
} satisfies FlapsCommand;
