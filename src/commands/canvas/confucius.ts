import confucius from "../../lib/canvas/confucius";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "confucius",
    name: "Confucius",
    desc: "Creates a wise Chinese philosopher",
    aliases: ["china"], // confucius is hard to type ok
    async execute(args) {
        let out = await confucius(args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Confucius", "png")
        );
    },
} satisfies FlapsCommand;
