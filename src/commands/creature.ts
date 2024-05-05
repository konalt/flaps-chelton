import { createCreatureImage } from "../lib/battle";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "creature",
    name: "Creature",
    desc: "Creates a creature!",
    async execute(args) {
        let image = await createCreatureImage(args[0]);
        return makeMessageResp(
            "flaps",
            "",
            null,
            image,
            getFileName("Creature", "png")
        );
    },
} satisfies FlapsCommand;
