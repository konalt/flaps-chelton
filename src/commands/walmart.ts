import { FlapsCommand } from "../types";
import { getFileName, makeMessageResp, randomRedditImage } from "../lib/utils";

module.exports = {
    id: "walmart",
    name: "Wal-Mart",
    desc: "Gets a photo of an average walmart customer.",
    async execute() {
        let image = await randomRedditImage("peopleofwalmart");
        return makeMessageResp(
            "walmart",
            "",
            image,
            getFileName("Reddit_Walmart", "png")
        );
    },
} satisfies FlapsCommand;
