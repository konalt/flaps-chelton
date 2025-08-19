import autism from "../../lib/canvas/autism";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "autismtest",
    name: "Autism Test",
    aliases: ["autism"],
    desc: "Autism :(",
    //needs: ["image"],
    async execute(args, buf) {
        let out = await autism([]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Autism", "png")
        );
    },
} satisfies FlapsCommand;
