import elysium from "../../lib/canvas/elysium";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "elysium",
    name: "Elysium",
    desc: "Disco Elysium Skillcheck",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await elysium(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Elysium", "png")
        );
    },
} satisfies FlapsCommand;
