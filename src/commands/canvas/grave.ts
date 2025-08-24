import grave from "../../lib/canvas/grave";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "grave",
    name: "Grave",
    desc: "Gone too soon...",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await grave(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Grave", "png")
        );
    },
} satisfies FlapsCommand;
