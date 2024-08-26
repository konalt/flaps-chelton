import { FlapsCommand } from "../types";
import { getFileName, makeMessageResp, randomRedditImage } from "../lib/utils";

module.exports = {
    id: "randompost",
    name: "Random Post",
    desc: "Gets a random post from a given subreddit.",
    async execute(args) {
        let image = await randomRedditImage(args[0]);
        return makeMessageResp(
            "haircut",
            "",
            image,
            getFileName("Reddit_RandomPost", "png")
        );
    },
} satisfies FlapsCommand;
