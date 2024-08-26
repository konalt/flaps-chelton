import carbs from "../../lib/canvas/carbs";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "carbs",
    name: "Carbs",
    desc: "Carbs against Hubaniby",
    async execute(args) {
        let out = await carbs(args[0] == "funny");
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Carbs", "png")
        );
    },
} satisfies FlapsCommand;
