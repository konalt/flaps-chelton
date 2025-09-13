import char from "../../lib/canvas/char";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "char",
    name: "Character",
    desc: "Uses a character template! Make sure you have the right ID!",
    needs: ["image"],
    async execute(args, buf) {
        let out = await char(args[0], buf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_CharacterTemplate", "png")
        );
    },
} satisfies FlapsCommand;
