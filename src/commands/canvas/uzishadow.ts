import uzishadow from "../../lib/canvas/uzishadow";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "uzishadow",
    name: "Uzi Shadow",
    desc: "Puts a shadow behind Uzi.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await uzishadow(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_UziShadow", "png")
        );
    },
} satisfies FlapsCommand;
