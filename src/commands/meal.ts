import { FlapsCommand } from "../types";
import { getFileName, makeMessageResp, randomRedditImage } from "../lib/utils";

module.exports = {
    id: "meal",
    name: "Meal",
    desc: "Gets a photo of a delicious dinner.",
    async execute() {
        let image = await randomRedditImage("StupidFood");
        return makeMessageResp(
            "lamazzu",
            "",
            image,
            getFileName("Reddit_Meal", "png")
        );
    },
} satisfies FlapsCommand;
