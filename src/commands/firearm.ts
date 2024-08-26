import { FlapsCommand } from "../types";
import { getFileName, makeMessageResp, randomRedditImage } from "../lib/utils";

module.exports = {
    id: "firearm",
    name: "Firearm",
    desc: "Gets a photo of a perfectly normal gun.",
    async execute() {
        let image = await randomRedditImage("cursedguns");
        return makeMessageResp(
            "haircut",
            "",
            image,
            getFileName("Reddit_Firearm", "png")
        );
    },
} satisfies FlapsCommand;
