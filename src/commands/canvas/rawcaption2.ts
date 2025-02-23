import { FlapsCommand } from "../../types";
import createCaption2 from "../../lib/canvas/createCaption2";
import { getFileName, makeMessageResp } from "../../lib/utils";

module.exports = {
    id: "rawcaption2",
    name: "Raw Caption2",
    desc: "Generates only a Caption2 caption. First argument is source image resolution, separated by an x.",
    async execute(args) {
        let w = parseInt(args[0].toLowerCase().split("x")[0]);
        let h = parseInt(args[0].toLowerCase().split("x")[1]);
        let out = await createCaption2(w, h, args.slice(1).join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_RawCaption2", "png")
        );
    },
} satisfies FlapsCommand;
